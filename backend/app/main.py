from __future__ import annotations

import json
import re
import shutil
import urllib.parse
import urllib.request
from datetime import datetime
from decimal import Decimal
from pathlib import Path
from typing import Optional
from uuid import uuid4

from fastapi import Cookie, Depends, FastAPI, File, Header, HTTPException, Query, Response, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from . import bootstrap
from .config import settings
from .database import get_db
from .models import AdminUser, AuthSession, CollectionItem, Customer, Order, OrderItem, PickupLocation, Product, WeeklyOrder
from .schemas import (
    AdminLoginIn,
    GoogleLoginIn,
    GuestLoginIn,
    LocalCheckIn,
    LocalLoginIn,
    OrderCommentPatchIn,
    OrderCreateIn,
    OrderPaymentPatchIn,
    OrderStatusPatchIn,
    PickupLocationPatchIn,
    PickupLocationUpsertIn,
    ProductPatchIn,
    ProductUpsertIn,
    UserTagIn,
    WeeklyOrderPatchIn,
)
from .security import generate_token, session_expiry, verify_password

APP_DIR = Path(__file__).resolve().parent
BACKEND_DIR = APP_DIR.parent
ADMIN_UI_DIR = BACKEND_DIR / "admin_ui"
UPLOAD_ROOT = Path(settings.upload_dir)
PRODUCT_UPLOAD_DIR = UPLOAD_ROOT / "products"

UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)
PRODUCT_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Makkie Admin API", version="0.2.0")
# credentials 模式下不能用 "*"：显式列出生产域名，本地任意端口用正则放行。
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://makkiemua.com", "https://www.makkiemua.com"],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/uploads", StaticFiles(directory=UPLOAD_ROOT), name="uploads")
app.mount("/admin", StaticFiles(directory=ADMIN_UI_DIR, html=True), name="admin")


@app.on_event("startup")
def startup() -> None:
    bootstrap.main()


def now_utc() -> datetime:
    return datetime.utcnow()


def format_money(amount: float | Decimal | None) -> str:
    value = round(float(amount or 0), 2)
    if float(value).is_integer():
        return f"${int(value)}"
    return f"${value:.2f}"


def model_to_dict(model):
    data = {}
    for column in model.__table__.columns:
        value = getattr(model, column.name)
        if isinstance(value, datetime):
            data[column.name] = value.isoformat()
        elif isinstance(value, Decimal):
            data[column.name] = float(value)
        else:
            data[column.name] = value
    return data


def schema_payload(schema, *, exclude_unset: bool = False) -> dict:
    if hasattr(schema, "model_dump"):
        return schema.model_dump(exclude_unset=exclude_unset)
    return schema.dict(exclude_unset=exclude_unset)


def parse_bearer_token(authorization: Optional[str]) -> Optional[str]:
    if not authorization:
        return None
    prefix = "Bearer "
    if authorization.startswith(prefix):
        return authorization[len(prefix) :].strip()
    return None


def get_session_by_token(db: Session, token: Optional[str]) -> Optional[AuthSession]:
    if not token:
        return None
    return (
        db.query(AuthSession)
        .filter(AuthSession.token == token, AuthSession.expires_at > now_utc())
        .one_or_none()
    )


def create_session(db: Session, *, subject_type: str, subject_id: int, client_id: Optional[str] = None) -> AuthSession:
    session = AuthSession(
        token=generate_token(),
        subject_type=subject_type,
        subject_id=subject_id,
        client_id=client_id,
        expires_at=session_expiry(),
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def serialize_customer_auth(customer: Customer, session: AuthSession, extra: Optional[dict] = None) -> dict:
    client_id = str(customer.client_id or "")
    login_type = "google" if client_id.startswith("google:") else "guest"
    user = {
        "id": customer.id,
        "nickname": customer.nickname,
        "name": customer.nickname,
        "login_type": login_type,
        "profile": {"nickname": customer.nickname},
        "is_admin": customer.is_admin,
        "isAdmin": customer.is_admin,
    }
    if extra:
        user.update(extra)
    return {
        "token": session.token,
        "user": user,
    }


def serialize_admin_auth(admin: AdminUser, session: AuthSession) -> dict:
    return {
        "token": session.token,
        "user": {
            "id": admin.id,
            "nickname": admin.display_name,
            "profile": {"nickname": admin.display_name},
            "username": admin.username,
            "is_admin": True,
            "isAdmin": True,
        },
    }


def get_current_admin(
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(default=None),
) -> AdminUser:
    token = parse_bearer_token(authorization)
    session = get_session_by_token(db, token)
    if not session or session.subject_type != "admin":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Admin login required")
    admin = db.get(AdminUser, session.subject_id)
    if not admin or not admin.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Admin not available")
    return admin


def get_current_weekly_order(db: Session) -> WeeklyOrder:
    weekly_order = (
        db.query(WeeklyOrder)
        .filter(WeeklyOrder.is_current.is_(True))
        .order_by(WeeklyOrder.id.desc())
        .first()
    )
    if weekly_order:
        return weekly_order
    weekly_order = WeeklyOrder(title="本周预定", description="", is_open=False, is_current=True)
    db.add(weekly_order)
    db.commit()
    db.refresh(weekly_order)
    return weekly_order


def make_order_no(order_id: int) -> str:
    return f"MM{datetime.utcnow():%y%m%d}{order_id:05d}"


def make_default_group_title() -> str:
    return f"A{datetime.utcnow():%Y%m%d}"


def resolve_local_nickname(body: LocalLoginIn) -> str:
    nickname = body.resolved_nickname
    if nickname:
        return nickname
    raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="nickname is required")


def normalize_product_payload(body, *, exclude_unset: bool = False) -> dict:
    payload = schema_payload(body, exclude_unset=exclude_unset)
    if "limit_per_order" in payload and "per_order_limit" not in payload:
        payload["per_order_limit"] = payload["limit_per_order"]
    payload.pop("limit_per_order", None)
    return payload


def serialize_weekly_order(weekly_order: WeeklyOrder) -> dict:
    payload = model_to_dict(weekly_order)
    payload["active_group_id"] = payload.get("active_group_id") or str(payload["id"])
    payload["group_id"] = payload["active_group_id"]
    payload["group_no"] = payload.get("group_no") or str(payload["id"])
    return payload


def serialize_product(product: Product) -> dict:
    payload = model_to_dict(product)
    payload["limit_per_order"] = payload.get("per_order_limit")
    payload["is_active"] = 1 if payload.get("is_active") else 0
    return payload


def slugify(value: str, fallback: str = "collection") -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", (value or "").lower()).strip("-")
    return slug or fallback


def serialize_collection_item(item: CollectionItem) -> dict:
    payload = model_to_dict(item)
    payload["title"] = {
        "zh": payload.get("title_zh") or "",
        "en": payload.get("title_en") or payload.get("title_zh") or "",
    }
    payload["image"] = payload.get("image_url") or ""
    return payload


def group_collection_items(items: list[CollectionItem]) -> list[dict]:
    groups: dict[str, dict] = {}
    for item in items:
        category = item.category or "创意甜品"
        group_id = f"dynamic-{slugify(category, 'creative')}"
        if group_id not in groups:
            groups[group_id] = {
                "id": group_id,
                "category": category,
                "title": {"zh": category, "en": category},
                "subtitle": {"zh": "后台新增甜品", "en": "New additions from admin"},
                "items": [],
            }
        groups[group_id]["items"].append(serialize_collection_item(item))
    return list(groups.values())


def sync_product_to_collection(db: Session, product: Product) -> Optional[CollectionItem]:
    if not product.image_url:
        return None
    category = product.category or "创意甜品"
    if category in {"Custom Upload", "Dessert"}:
        category = "创意甜品"
    item = None
    if product.id:
        item = db.query(CollectionItem).filter(CollectionItem.product_id == product.id).one_or_none()
    if item is None:
        item = CollectionItem(product_id=product.id)
        db.add(item)
    item.category = category
    item.title_zh = product.name
    item.title_en = product.name
    item.image_url = product.image_url
    item.is_active = True
    return item


def serialize_pickup(pickup: PickupLocation) -> dict:
    payload = model_to_dict(pickup)
    payload["label"] = payload.get("label") or payload.get("name")
    payload["window"] = payload.get("pickup_time") or ""
    payload["instruction"] = payload.get("note") or ""
    payload["is_active"] = 1 if payload.get("is_active") else 0
    return payload


def serialize_order(order: Order) -> dict:
    payload = model_to_dict(order)
    try:
        pickup_snapshot = json.loads(order.pickup_snapshot or "{}")
    except json.JSONDecodeError:
        pickup_snapshot = {}

    if not isinstance(pickup_snapshot, dict):
        pickup_snapshot = {}

    pickup_payload = {
        "id": order.pickup_location_id,
        "name": order.pickup_location_name or pickup_snapshot.get("name") or pickup_snapshot.get("label") or "",
        "label": pickup_snapshot.get("label")
        or order.pickup_location_name
        or pickup_snapshot.get("name")
        or "",
        "address": pickup_snapshot.get("address") or "",
        "pickup_time": pickup_snapshot.get("pickup_time") or pickup_snapshot.get("time") or "",
        "time": pickup_snapshot.get("pickup_time") or pickup_snapshot.get("time") or "",
        "note": pickup_snapshot.get("note") or pickup_snapshot.get("instruction") or "",
        "instruction": pickup_snapshot.get("note") or pickup_snapshot.get("instruction") or "",
    }

    items = []
    for item in order.items:
        item_payload = model_to_dict(item)
        try:
            product_snapshot = json.loads(item.product_snapshot or "{}")
        except json.JSONDecodeError:
            product_snapshot = {}
        if not isinstance(product_snapshot, dict):
            product_snapshot = {}
        unit_price = float(item_payload.get("unit_price") or 0)
        quantity = int(item_payload.get("quantity") or 0)
        subtotal = round(unit_price * quantity, 2)
        item_payload["title"] = item.product_name
        item_payload["name"] = item.product_name
        item_payload["image"] = product_snapshot.get("image_url") or ""
        item_payload["subtotal"] = subtotal
        item_payload["subtotalText"] = format_money(subtotal)
        item_payload["price"] = f"{format_money(unit_price)} / 个"
        items.append(item_payload)

    total_amount = float(payload.get("subtotal") or 0)
    payload["items"] = items
    payload["pickup_snapshot"] = pickup_snapshot
    payload["pickup"] = pickup_payload
    payload["notes"] = payload.get("note") or ""
    payload["user_id"] = payload.get("customer_id")
    payload["userUuid"] = payload.get("client_id") or ""
    payload["total_amount"] = total_amount
    payload["orderNumber"] = payload.get("order_no")
    payload["groupOrderNumberText"] = payload.get("order_no")
    payload["userNickname"] = payload.get("nickname") or ""
    payload["paymentStatus"] = payload.get("payment_status")
    payload["paymentMethod"] = payload.get("payment_method")
    payload["paymentNote"] = payload.get("payment_note")
    payload["paidAt"] = payload.get("paid_at")
    payload["createdAt"] = payload.get("created_at")
    payload["updatedAt"] = payload.get("updated_at")
    payload["group_id"] = payload.get("weekly_order_id")
    payload["groupId"] = payload.get("weekly_order_id")
    payload["total"] = {"amount": total_amount, "text": format_money(total_amount), "currency": "USD"}
    return payload


def build_customer_summary(db: Session, customer: Customer) -> dict:
    order_count, total_spent, last_order_at = (
        db.query(
            func.count(Order.id),
            func.coalesce(func.sum(Order.subtotal), 0),
            func.max(Order.created_at),
        )
        .filter(Order.customer_id == customer.id)
        .one()
    )
    total_spent_value = round(float(total_spent or 0), 2)
    return {
        "id": customer.id,
        "uuid": customer.client_id,
        "client_id": customer.client_id,
        "nickname": customer.nickname,
        "is_admin": customer.is_admin,
        "tag": customer.tag or "user",
        "order_count": int(order_count or 0),
        "total_spent": total_spent_value,
        "total_spent_text": format_money(total_spent_value),
        "last_order_at": last_order_at.isoformat() if isinstance(last_order_at, datetime) else last_order_at,
    }


def save_upload(file: UploadFile, directory: Path) -> str:
    suffix = Path(file.filename or "").suffix.lower() or ".jpg"
    filename = f"{uuid4().hex}{suffix}"
    target = directory / filename
    with target.open("wb") as output:
        shutil.copyfileobj(file.file, output)
    return filename


def create_weekly_order_record(db: Session, payload: dict) -> WeeklyOrder:
    db.query(WeeklyOrder).filter(WeeklyOrder.is_current.is_(True)).update({"is_current": False})
    weekly_order = WeeklyOrder(
        title=payload.get("title") or make_default_group_title(),
        description=payload.get("description") or "",
        is_open=bool(payload.get("is_open", False)),
        is_current=True,
        deadline_text=payload.get("deadline_text"),
        start_at=payload.get("start_at"),
        order_deadline_at=payload.get("order_deadline_at"),
        active_group_id=payload.get("active_group_id") or None,
        group_no=payload.get("group_no") or None,
    )
    db.add(weekly_order)
    db.flush()
    if not weekly_order.active_group_id:
        weekly_order.active_group_id = str(weekly_order.id)
    if not weekly_order.group_no:
        weekly_order.group_no = str(weekly_order.id)
    db.commit()
    db.refresh(weekly_order)
    return weekly_order


@app.get("/")
def root():
    return RedirectResponse(url="/admin/", status_code=status.HTTP_307_TEMPORARY_REDIRECT)


@app.get("/health")
def health():
    return {"ok": True, "service": "makkie-admin-api"}


@app.post("/api/auth/local-login")
def local_login(body: LocalLoginIn, db: Session = Depends(get_db)):
    nickname = resolve_local_nickname(body)
    customer = db.query(Customer).filter(Customer.client_id == body.client_id).one_or_none()
    is_admin = nickname in settings.admin_bootstrap_nicknames
    if customer is None:
        customer = Customer(client_id=body.client_id, nickname=nickname, is_admin=is_admin)
        db.add(customer)
    else:
        customer.nickname = nickname
        customer.is_admin = is_admin
    db.commit()
    db.refresh(customer)
    session = create_session(db, subject_type="customer", subject_id=customer.id, client_id=body.client_id)
    return serialize_customer_auth(customer, session)


@app.post("/api/auth/local-check")
def local_check(
    body: LocalCheckIn,
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(default=None),
):
    existing_session = get_session_by_token(db, parse_bearer_token(authorization))
    if existing_session:
        if existing_session.subject_type == "customer":
            customer = db.get(Customer, existing_session.subject_id)
            if customer:
                return serialize_customer_auth(customer, existing_session)
        if existing_session.subject_type == "admin":
            admin = db.get(AdminUser, existing_session.subject_id)
            if admin:
                return serialize_admin_auth(admin, existing_session)

    customer = db.query(Customer).filter(Customer.client_id == body.client_id).one_or_none()
    if customer is None:
        return {"user": None, "token": None}
    session = create_session(db, subject_type="customer", subject_id=customer.id, client_id=body.client_id)
    return serialize_customer_auth(customer, session)


AUTH_COOKIE_NAME = "makkie_token"


def set_auth_cookie(response: Response, token: str) -> None:
    # 本地开发是 http，secure=True 的 cookie 会被浏览器丢弃；
    # 线上 Node 后端（makkie-web-api）设置的同名 cookie 是 Secure 的。
    response.set_cookie(
        AUTH_COOKIE_NAME,
        token,
        httponly=True,
        samesite="lax",
        max_age=7 * 24 * 60 * 60,
    )


def verify_google_credential(credential: str) -> dict:
    client_id = getattr(settings, "google_client_id", "")
    if not client_id or client_id.startswith("REPLACE"):
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="服务器未配置 GOOGLE_CLIENT_ID")
    url = f"https://oauth2.googleapis.com/tokeninfo?{urllib.parse.urlencode({'id_token': credential})}"
    try:
        with urllib.request.urlopen(url, timeout=10) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Google 登录校验失败")
    if payload.get("aud") != client_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Google credential audience 不匹配")
    if payload.get("iss") not in ("accounts.google.com", "https://accounts.google.com"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Google credential 签发方不正确")
    if not payload.get("sub"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Google credential 缺少用户标识")
    return payload


def merge_browser_orders(db: Session, browser_client_id: Optional[str], target: Customer) -> int:
    """把同一浏览器的旧匿名/游客身份下的订单迁移到刚登录的账号。

    让用户「登录后能看到之前下的单」。只改订单归属，保留旧 customer 记录
    （它可能是 admin 引导身份）。若浏览器 client_id 缺失或就是当前账号则跳过。
    """
    src_id = (browser_client_id or "").strip()
    if not src_id:
        return 0
    src = db.query(Customer).filter(Customer.client_id == src_id).one_or_none()
    if src is None or src.id == target.id:
        return 0
    moved = (
        db.query(Order)
        .filter(Order.customer_id == src.id)
        .update({Order.customer_id: target.id}, synchronize_session=False)
    )
    db.commit()
    return moved


@app.post("/api/auth/google")
def google_login(body: GoogleLoginIn, response: Response, db: Session = Depends(get_db)):
    payload = verify_google_credential(body.credential)
    google_sub = payload["sub"]
    email = payload.get("email") or ""
    name = payload.get("name") or email or "Google 用户"
    picture = payload.get("picture") or ""

    client_id = f"google:{google_sub}"
    customer = db.query(Customer).filter(Customer.client_id == client_id).one_or_none()
    if customer is None:
        customer = Customer(client_id=client_id, nickname=name, is_admin=False)
        db.add(customer)
    elif not customer.nickname:
        customer.nickname = name
    db.commit()
    db.refresh(customer)

    merge_browser_orders(db, body.client_id, customer)

    session = create_session(db, subject_type="customer", subject_id=customer.id, client_id=client_id)
    set_auth_cookie(response, session.token)
    return serialize_customer_auth(customer, session, extra={"email": email, "picture": picture, "name": name})


@app.post("/api/auth/guest")
def guest_login(body: GuestLoginIn, response: Response, db: Session = Depends(get_db)):
    nickname = body.nickname.strip()
    if not nickname:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="请输入昵称")

    client_id = (body.client_id or "").strip() or f"guest_{uuid4().hex[:12]}"
    customer = db.query(Customer).filter(Customer.client_id == client_id).one_or_none()
    is_admin = nickname in settings.admin_bootstrap_nicknames
    if customer is None:
        customer = Customer(client_id=client_id, nickname=nickname, is_admin=is_admin)
        db.add(customer)
    else:
        customer.nickname = nickname
        customer.is_admin = is_admin or customer.is_admin
    db.commit()
    db.refresh(customer)

    session = create_session(db, subject_type="customer", subject_id=customer.id, client_id=client_id)
    set_auth_cookie(response, session.token)
    return serialize_customer_auth(customer, session)


@app.get("/api/me")
def get_me(
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(default=None),
    makkie_token: Optional[str] = Cookie(default=None),
):
    token = parse_bearer_token(authorization) or makkie_token or ""
    session = get_session_by_token(db, token)
    if not session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="未登录")
    if session.subject_type == "customer":
        customer = db.get(Customer, session.subject_id)
        if customer:
            return {"ok": True, "user": serialize_customer_auth(customer, session)["user"]}
    if session.subject_type == "admin":
        admin = db.get(AdminUser, session.subject_id)
        if admin:
            return {"ok": True, "user": serialize_admin_auth(admin, session)["user"]}
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="用户不存在")


@app.post("/api/logout")
def logout(response: Response):
    response.delete_cookie(AUTH_COOKIE_NAME)
    return {"ok": True}


@app.post("/api/admin/login")
def admin_login(body: AdminLoginIn, db: Session = Depends(get_db)):
    admin = db.query(AdminUser).filter(AdminUser.username == body.username).one_or_none()
    if admin is None or not admin.is_active or not verify_password(body.password, admin.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin credentials")
    session = create_session(db, subject_type="admin", subject_id=admin.id)
    return serialize_admin_auth(admin, session)


@app.get("/api/weekly-order")
def get_weekly_order(db: Session = Depends(get_db)):
    return {"weekly_order": serialize_weekly_order(get_current_weekly_order(db))}


@app.get("/api/products")
def get_products(db: Session = Depends(get_db)):
    weekly_order = get_current_weekly_order(db)
    products = (
        db.query(Product)
        .filter(Product.is_active.is_(True))
        .filter((Product.weekly_order_id == weekly_order.id) | (Product.weekly_order_id.is_(None)))
        .order_by(Product.sort_order.asc(), Product.id.asc())
        .all()
    )
    return {"products": [serialize_product(product) for product in products]}


@app.get("/api/collection")
def get_collection(db: Session = Depends(get_db)):
    items = (
        db.query(CollectionItem)
        .filter(CollectionItem.is_active.is_(True))
        .order_by(CollectionItem.category.asc(), CollectionItem.sort_order.asc(), CollectionItem.id.asc())
        .all()
    )
    return {"groups": group_collection_items(items), "items": [serialize_collection_item(item) for item in items]}


@app.get("/api/pickup-locations")
def get_pickup_locations(db: Session = Depends(get_db)):
    pickups = (
        db.query(PickupLocation)
        .filter(PickupLocation.is_active.is_(True))
        .order_by(PickupLocation.sort_order.asc(), PickupLocation.id.asc())
        .all()
    )
    return {"pickup_locations": [serialize_pickup(pickup) for pickup in pickups]}


@app.post("/api/orders")
def create_order(
    body: OrderCreateIn,
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(default=None),
):
    weekly_order = get_current_weekly_order(db)
    if not weekly_order.is_open:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Weekly preorder is closed")

    session = get_session_by_token(db, parse_bearer_token(authorization))
    customer = db.get(Customer, session.subject_id) if session and session.subject_type == "customer" else None
    if customer is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Customer identity required")

    if not body.items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order items are required")

    pickup = None
    pickup_id = None
    if body.pickup_location_id not in (None, ""):
        try:
            pickup_id = int(body.pickup_location_id)
        except (TypeError, ValueError):
            pickup_id = None
    if pickup_id:
        pickup = db.get(PickupLocation, pickup_id)

    pickup_snapshot = body.pickup_snapshot
    if pickup_snapshot is None and pickup is not None:
        pickup_snapshot = serialize_pickup(pickup)

    order = Order(
        order_no="pending",
        customer_id=customer.id,
        client_id=customer.client_id,
        nickname=customer.nickname,
        weekly_order_id=weekly_order.id,
        pickup_location_id=pickup.id if pickup else None,
        pickup_location_name=body.pickup_location_name or (pickup.name if pickup else None),
        pickup_snapshot=json.dumps(pickup_snapshot or {}, ensure_ascii=False),
        note=body.note,
        status="pending",
        payment_status="non_paid",
    )
    db.add(order)
    db.flush()

    subtotal = 0.0
    for item in body.items:
        product = None
        if item.product_id not in (None, ""):
            try:
                product = db.get(Product, int(item.product_id))
            except (TypeError, ValueError):
                product = None
        if product is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Product not found")
        if product.stock < item.quantity:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"{product.name} stock is not enough")
        if product.per_order_limit and item.quantity > product.per_order_limit:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{product.name} exceeds per-order limit",
            )

        product.stock -= item.quantity
        unit_price = float(item.unit_price if item.unit_price is not None else product.price or 0)
        subtotal += unit_price * item.quantity
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=product.id,
                product_name=item.product_name or product.name,
                quantity=item.quantity,
                unit_price=unit_price,
                product_snapshot=json.dumps(serialize_product(product), ensure_ascii=False),
            )
        )

    order.subtotal = round(subtotal, 2)
    order.order_no = make_order_no(order.id)
    db.commit()
    db.refresh(order)
    persisted_order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order.id).one()
    return {"order": serialize_order(persisted_order)}


@app.get("/api/orders/user/{user_id}")
def get_user_orders(
    user_id: int,
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(default=None),
):
    session = get_session_by_token(db, parse_bearer_token(authorization))
    if not session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Login required")
    is_admin = session.subject_type == "admin"
    if not is_admin and not (session.subject_type == "customer" and session.subject_id == user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot view other users' orders")

    orders = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.customer_id == user_id)
        .order_by(Order.created_at.desc(), Order.id.desc())
        .all()
    )

    # Per-group sequence numbers (1, 2, 3 within each weekly group), reset each group.
    seq_map: dict = {}
    for group_id in {order.weekly_order_id for order in orders}:
        siblings = (
            db.query(Order.id)
            .filter(Order.weekly_order_id == group_id)
            .order_by(Order.created_at.asc(), Order.id.asc())
            .all()
        )
        for index, row in enumerate(siblings):
            seq_map[row.id] = index + 1

    result = []
    for order in orders:
        payload = serialize_order(order)
        payload["group_order_number"] = seq_map.get(order.id)
        result.append(payload)
    return {"isAdmin": is_admin, "orders": result}


@app.get("/api/admin/weekly-order")
def admin_get_weekly_order(db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    return {"weekly_order": serialize_weekly_order(get_current_weekly_order(db))}


@app.get("/api/admin/weekly-orders")
def admin_list_weekly_orders(db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    weekly_orders = db.query(WeeklyOrder).order_by(WeeklyOrder.created_at.desc(), WeeklyOrder.id.desc()).all()
    return {"weekly_orders": [serialize_weekly_order(item) for item in weekly_orders]}


@app.post("/api/admin/weekly-orders")
def admin_create_weekly_order(
    body: WeeklyOrderPatchIn,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    weekly_order = create_weekly_order_record(db, schema_payload(body, exclude_unset=True))
    return {"weekly_order": serialize_weekly_order(weekly_order)}


@app.patch("/api/admin/weekly-order")
def patch_weekly_order(
    body: WeeklyOrderPatchIn,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    weekly_order = get_current_weekly_order(db)
    for field, value in schema_payload(body, exclude_unset=True).items():
        setattr(weekly_order, field, value)
    db.commit()
    db.refresh(weekly_order)
    return {"weekly_order": serialize_weekly_order(weekly_order)}


@app.get("/api/admin/stats")
def admin_stats(db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    order_count = db.query(func.count(Order.id)).scalar() or 0
    total_revenue = round(float(db.query(func.coalesce(func.sum(Order.subtotal), 0)).scalar() or 0), 2)
    user_count = db.query(func.count(Customer.id)).scalar() or 0
    active_product_count = db.query(func.count(Product.id)).filter(Product.is_active.is_(True)).scalar() or 0
    return {
        "stats": {
            "order_count": int(order_count),
            "total_revenue": total_revenue,
            "total_revenue_text": format_money(total_revenue),
            "user_count": int(user_count),
            "active_product_count": int(active_product_count),
        }
    }


@app.get("/api/admin/orders")
def admin_orders(
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
    status_filter: Optional[str] = Query(default=None, alias="status"),
    payment_status: Optional[str] = Query(default=None),
    payment_method: Optional[str] = Query(default=None),
    q: Optional[str] = Query(default=None),
):
    query = db.query(Order).options(joinedload(Order.items)).order_by(Order.created_at.desc(), Order.id.desc())
    if status_filter:
        query = query.filter(Order.status == status_filter)
    if payment_status:
        query = query.filter(Order.payment_status == payment_status)
    if payment_method:
        query = query.filter(Order.payment_method == payment_method)
    if q:
        like = f"%{q}%"
        query = query.filter(
            (Order.order_no.ilike(like))
            | (Order.nickname.ilike(like))
            | (Order.pickup_location_name.ilike(like))
        )
    orders = query.all()
    return {"orders": [serialize_order(order) for order in orders]}


@app.get("/api/admin/orders/{order_id}")
def admin_order_detail(order_id: int, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).one_or_none()
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return {"order": serialize_order(order)}


@app.patch("/api/admin/orders/{order_id}/status")
def admin_patch_order_status(
    order_id: int,
    body: OrderStatusPatchIn,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    order = db.get(Order, order_id)
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    order.status = body.status
    db.commit()
    db.refresh(order)
    return {"order": serialize_order(db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).one())}


@app.patch("/api/admin/orders/{order_id}/payment")
def admin_patch_order_payment(
    order_id: int,
    body: OrderPaymentPatchIn,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    order = db.get(Order, order_id)
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    order.payment_status = body.payment_status
    order.payment_method = body.payment_method
    order.payment_note = body.payment_note
    order.payment_marked_by = admin.id
    order.paid_at = now_utc() if body.payment_status == "paid" else None
    db.commit()
    db.refresh(order)
    return {"order": serialize_order(db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).one())}


@app.patch("/api/admin/orders/{order_id}/comment")
def admin_patch_order_comment(
    order_id: int,
    body: OrderCommentPatchIn,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    order = db.get(Order, order_id)
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    order.admin_comment = body.admin_comment
    db.commit()
    db.refresh(order)
    return {"order": serialize_order(db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).one())}


@app.get("/api/admin/users")
def admin_users(db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    customers = db.query(Customer).order_by(Customer.updated_at.desc(), Customer.id.desc()).all()
    return {"users": [build_customer_summary(db, customer) for customer in customers]}


@app.patch("/api/admin/users/{user_id}/tag")
def admin_update_user_tag(
    user_id: int,
    body: UserTagIn,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    customer = db.get(Customer, user_id)
    if customer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="用户不存在")
    customer.tag = body.tag if body.tag in ("user", "tester") else "user"
    db.commit()
    db.refresh(customer)
    return {"user": {"id": customer.id, "nickname": customer.nickname, "tag": customer.tag}}


@app.get("/api/admin/analytics/members")
def admin_member_analytics(
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
    sort: str = Query(default="total_spent"),
    limit: int = Query(default=500),
):
    customers = db.query(Customer).order_by(Customer.updated_at.desc(), Customer.id.desc()).all()
    members = [build_customer_summary(db, customer) for customer in customers]
    if sort == "order_count":
        members.sort(key=lambda item: (item["order_count"], item["total_spent"]), reverse=True)
    elif sort == "last_order_at":
        members.sort(key=lambda item: item["last_order_at"] or "", reverse=True)
    else:
        members.sort(key=lambda item: (item["total_spent"], item["order_count"]), reverse=True)
    return {"members": members[: max(1, min(limit, 2000))]}


@app.get("/api/admin/products")
def admin_products(db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    products = db.query(Product).order_by(Product.sort_order.asc(), Product.id.asc()).all()
    return {"products": [serialize_product(product) for product in products]}


@app.get("/api/admin/collection")
def admin_collection(db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    items = db.query(CollectionItem).order_by(CollectionItem.category.asc(), CollectionItem.sort_order.asc(), CollectionItem.id.asc()).all()
    return {"groups": group_collection_items(items), "items": [serialize_collection_item(item) for item in items]}


@app.post("/api/admin/products")
def admin_create_product(body: ProductUpsertIn, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    product = Product(**normalize_product_payload(body))
    db.add(product)
    db.commit()
    db.refresh(product)
    return {"product": serialize_product(product)}


@app.patch("/api/admin/products/{product_id}")
def admin_patch_product(
    product_id: int,
    body: ProductPatchIn,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    for field, value in normalize_product_payload(body, exclude_unset=True).items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return {"product": serialize_product(product)}


@app.delete("/api/admin/products/{product_id}")
def admin_delete_product(product_id: int, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    in_use = db.query(OrderItem.id).filter(OrderItem.product_id == product_id).first()
    if in_use:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="这个商品已有订单记录，不能删除；可以先隐藏或下架",
        )
    payload = serialize_product(product)
    db.delete(product)
    db.commit()
    return {"product": payload}


@app.post("/api/admin/products/{product_id}/image")
def admin_upload_product_image(
    product_id: int,
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    if not image.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Please choose an image")
    if image.content_type and not image.content_type.startswith("image/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only image uploads are allowed")
    filename = save_upload(image, PRODUCT_UPLOAD_DIR)
    product.image_url = f"/uploads/products/{filename}"
    sync_product_to_collection(db, product)
    db.commit()
    db.refresh(product)
    return {"image_url": product.image_url, "product": serialize_product(product)}


@app.get("/api/admin/pickup-locations")
def admin_pickup_locations(db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    pickups = db.query(PickupLocation).order_by(PickupLocation.sort_order.asc(), PickupLocation.id.asc()).all()
    return {"pickup_locations": [serialize_pickup(pickup) for pickup in pickups]}


@app.post("/api/admin/pickup-locations")
def admin_create_pickup_location(
    body: PickupLocationUpsertIn,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    pickup = PickupLocation(**schema_payload(body))
    db.add(pickup)
    db.commit()
    db.refresh(pickup)
    return {"pickup_location": serialize_pickup(pickup)}


@app.patch("/api/admin/pickup-locations/{pickup_id}")
def admin_patch_pickup_location(
    pickup_id: int,
    body: PickupLocationPatchIn,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    pickup = db.get(PickupLocation, pickup_id)
    if pickup is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pickup location not found")
    for field, value in schema_payload(body, exclude_unset=True).items():
        setattr(pickup, field, value)
    db.commit()
    db.refresh(pickup)
    return {"pickup_location": serialize_pickup(pickup)}
