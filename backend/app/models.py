from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def utcnow() -> datetime:
    return datetime.utcnow()


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    client_id: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    nickname: Mapped[str] = mapped_column(String(120))
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)


class AdminUser(Base):
    __tablename__ = "admin_users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    display_name: Mapped[str] = mapped_column(String(120))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)


class AuthSession(Base):
    __tablename__ = "auth_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    token: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    subject_type: Mapped[str] = mapped_column(String(20), index=True)
    subject_id: Mapped[int] = mapped_column(Integer, index=True)
    client_id: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class WeeklyOrder(Base):
    __tablename__ = "weekly_orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200), default="本周预定")
    description: Mapped[str] = mapped_column(Text, default="")
    is_open: Mapped[bool] = mapped_column(Boolean, default=False)
    is_current: Mapped[bool] = mapped_column(Boolean, default=True)
    active_group_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    group_no: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    deadline_text: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    order_deadline_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)

    products: Mapped[List["Product"]] = relationship("Product", back_populates="weekly_order")


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    weekly_order_id: Mapped[Optional[int]] = mapped_column(ForeignKey("weekly_orders.id"), nullable=True)
    category: Mapped[str] = mapped_column(String(120), default="Dessert")
    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text, default="")
    price: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    price_text: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    stock: Mapped[int] = mapped_column(Integer, default=0)
    per_order_limit: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    image_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)

    weekly_order: Mapped[Optional[WeeklyOrder]] = relationship("WeeklyOrder", back_populates="products")


class PickupLocation(Base):
    __tablename__ = "pickup_locations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    label: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    address: Mapped[str] = mapped_column(Text, default="")
    note: Mapped[str] = mapped_column(Text, default="")
    pickup_time: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    area: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    zipcode: Mapped[Optional[str]] = mapped_column(String(40), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    order_no: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    customer_id: Mapped[Optional[int]] = mapped_column(ForeignKey("customers.id"), nullable=True)
    client_id: Mapped[str] = mapped_column(String(120), index=True)
    nickname: Mapped[str] = mapped_column(String(120))
    weekly_order_id: Mapped[Optional[int]] = mapped_column(ForeignKey("weekly_orders.id"), nullable=True)
    pickup_location_id: Mapped[Optional[int]] = mapped_column(ForeignKey("pickup_locations.id"), nullable=True)
    pickup_location_name: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    pickup_snapshot: Mapped[str] = mapped_column(Text, default="")
    note: Mapped[str] = mapped_column(Text, default="")
    admin_comment: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(40), default="new")
    subtotal: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    payment_status: Mapped[str] = mapped_column(String(40), default="non_paid")
    payment_method: Mapped[Optional[str]] = mapped_column(String(40), nullable=True)
    paid_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    payment_note: Mapped[str] = mapped_column(Text, default="")
    payment_marked_by: Mapped[Optional[int]] = mapped_column(ForeignKey("admin_users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)

    items: Mapped[List["OrderItem"]] = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"
    __table_args__ = (UniqueConstraint("order_id", "product_id", name="uq_order_product"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"), index=True)
    product_id: Mapped[Optional[int]] = mapped_column(ForeignKey("products.id"), nullable=True)
    product_name: Mapped[str] = mapped_column(String(200))
    quantity: Mapped[int] = mapped_column(Integer)
    unit_price: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    product_snapshot: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    order: Mapped[Order] = relationship("Order", back_populates="items")
