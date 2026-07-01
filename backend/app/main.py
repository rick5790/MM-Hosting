from __future__ import annotations

import json
import shutil
from datetime import datetime
from decimal import Decimal
from pathlib import Path
from typing import Optional
from uuid import uuid4

from fastapi import Depends, FastAPI, File, Header, HTTPException, Query, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from . import bootstrap
from .config import settings
from .database import get_db
from .models import AdminUser, AuthSession, Customer, Order, OrderItem, PickupLocation, Product, WeeklyOrder
from .schemas import (
    AdminLoginIn,
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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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


def serialize_customer_auth(customer: Customer, session: AuthSession) -> dict:
    return {
        "token": session.token,
        "user": {
            "id": customer.id,
            "nickname": customer.nickname,
            "profile": {"nickname": customer.nickname},
            "is_admin": customer.is_admin,
            "isAdmin": customer.is_admin,
        },
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
        "client_id": customer.client_id,
        "nickname": customer.nickname,
        "is_admin": customer.is_admin,
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


@app.get("/api/admin/weekly-order")
def admin_get_weekly_order(db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    return {"weekly_order": serialize_weekly_order(get_current_weekly_order(db))}


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
