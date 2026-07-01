from __future__ import annotations

from pathlib import Path

from sqlalchemy import inspect, text
from sqlalchemy.orm import Session

from .config import settings
from .database import Base, SessionLocal, engine
from .models import AdminUser, PickupLocation, WeeklyOrder
from .security import hash_password


def ensure_runtime_columns(db: Session) -> None:
    inspector = inspect(engine)
    order_columns = {column["name"] for column in inspector.get_columns("orders")}
    if "admin_comment" not in order_columns:
        db.execute(text("ALTER TABLE orders ADD COLUMN admin_comment TEXT NOT NULL DEFAULT ''"))
        db.commit()


def ensure_upload_dirs() -> None:
    upload_root = Path(settings.upload_dir)
    (upload_root / "products").mkdir(parents=True, exist_ok=True)


def ensure_bootstrap_records(db: Session) -> None:
    admin = db.query(AdminUser).filter(AdminUser.username == settings.makkie_admin_username).one_or_none()
    if admin is None:
        db.add(
            AdminUser(
                username=settings.makkie_admin_username,
                password_hash=hash_password(settings.makkie_admin_password),
                display_name=settings.makkie_admin_display_name,
            )
        )

    weekly_order = (
        db.query(WeeklyOrder)
        .filter(WeeklyOrder.is_current.is_(True))
        .order_by(WeeklyOrder.id.desc())
        .first()
    )
    if weekly_order is None:
        db.add(
            WeeklyOrder(
                title="本周预定",
                description="本周甜品将由后台同步后显示。",
                is_open=False,
                is_current=True,
            )
        )

    if db.query(PickupLocation).count() == 0:
        db.add_all(
            [
                PickupLocation(
                    name="尔湾",
                    label="Irvine",
                    address="14282 Culver Dr, Irvine, 92604",
                    note="Heritage Plaza, Chase 银行停车场靠近ATM机，Tesla充电桩对面",
                    pickup_time="周六 12:30 - 13:00",
                    area="Orange County",
                    zipcode="92604",
                    sort_order=1,
                ),
                PickupLocation(
                    name="洛杉矶",
                    label="Los Angeles",
                    address="509 S Santa Fe Ave, Los Angeles, 90013",
                    note="Alloy公寓楼下，靠近4th桥底车库门",
                    pickup_time="周六 14:00 - 14:30",
                    area="Los Angeles",
                    zipcode="90013",
                    sort_order=2,
                ),
            ]
        )
    db.commit()

    pickups = db.query(PickupLocation).all()
    for pickup in pickups:
        haystack = " ".join(
            [
                pickup.name or "",
                pickup.label or "",
                pickup.address or "",
                pickup.area or "",
            ]
        ).lower()

        if any(token in haystack for token in ("irvine", "culver", "尔湾")):
            if pickup.name in {"Irvine", "", None}:
                pickup.name = "尔湾"
            if not pickup.label:
                pickup.label = "Irvine"
            if not pickup.address or "culver dr" in pickup.address.lower():
                pickup.address = "14282 Culver Dr, Irvine, 92604"
            if not pickup.note:
                pickup.note = "Heritage Plaza, Chase 银行停车场靠近ATM机，Tesla充电桩对面"
            if not pickup.pickup_time:
                pickup.pickup_time = "周六 12:30 - 13:00"
            if not pickup.area:
                pickup.area = "Orange County"
            if not pickup.zipcode:
                pickup.zipcode = "92604"

        if any(token in haystack for token in ("los angeles", "santa fe", "洛杉矶")):
            if pickup.name in {"Los Angeles", "", None}:
                pickup.name = "洛杉矶"
            if not pickup.label:
                pickup.label = "Los Angeles"
            if not pickup.address or "525 s santa fe" in pickup.address.lower():
                pickup.address = "509 S Santa Fe Ave, Los Angeles, 90013"
            if not pickup.note:
                pickup.note = "Alloy公寓楼下，靠近4th桥底车库门"
            if not pickup.pickup_time:
                pickup.pickup_time = "周六 14:00 - 14:30"
            if not pickup.area:
                pickup.area = "Los Angeles"
            if not pickup.zipcode:
                pickup.zipcode = "90013"

    db.commit()


def main() -> None:
    Base.metadata.create_all(bind=engine)
    ensure_upload_dirs()
    db = SessionLocal()
    try:
        ensure_runtime_columns(db)
        ensure_bootstrap_records(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
