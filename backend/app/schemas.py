from __future__ import annotations

from datetime import datetime
from typing import List, Optional, Union

from pydantic import BaseModel, Field
from typing_extensions import Literal


class LocalProfileIn(BaseModel):
    nickname: Optional[str] = Field(default=None, max_length=120)


class LocalLoginIn(BaseModel):
    client_id: str = Field(min_length=4, max_length=120)
    nickname: Optional[str] = Field(default=None, max_length=120)
    profile: Optional[LocalProfileIn] = None

    @property
    def resolved_nickname(self) -> str:
        if self.nickname and self.nickname.strip():
            return self.nickname.strip()
        if self.profile and self.profile.nickname and self.profile.nickname.strip():
            return self.profile.nickname.strip()
        return ""


class LocalCheckIn(BaseModel):
    client_id: str = Field(min_length=4, max_length=120)


class GoogleLoginIn(BaseModel):
    credential: str = Field(min_length=10)
    client_id: Optional[str] = Field(default=None, max_length=120)


class GuestLoginIn(BaseModel):
    nickname: str = Field(min_length=1, max_length=30)
    client_id: Optional[str] = Field(default=None, max_length=120)


class UserTagIn(BaseModel):
    tag: str = Field(default="user", max_length=20)


class AdminLoginIn(BaseModel):
    username: str = Field(min_length=1, max_length=80)
    password: str = Field(min_length=1, max_length=255)


class WeeklyOrderPatchIn(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_open: Optional[bool] = None
    deadline_text: Optional[str] = None
    start_at: Optional[datetime] = None
    order_deadline_at: Optional[datetime] = None
    active_group_id: Optional[str] = None
    group_no: Optional[str] = None


class ProductUpsertIn(BaseModel):
    weekly_order_id: Optional[int] = None
    category: str = "Dessert"
    name: str
    description: str = ""
    price: float = 0
    price_text: Optional[str] = None
    stock: int = 0
    per_order_limit: Optional[int] = None
    limit_per_order: Optional[int] = None
    image_url: Optional[str] = None
    is_active: bool = True
    sort_order: int = 0


class ProductPatchIn(BaseModel):
    weekly_order_id: Optional[int] = None
    category: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    price_text: Optional[str] = None
    stock: Optional[int] = None
    per_order_limit: Optional[int] = None
    limit_per_order: Optional[int] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None


class PickupLocationUpsertIn(BaseModel):
    name: str
    label: Optional[str] = None
    address: str = ""
    note: str = ""
    pickup_time: Optional[str] = None
    area: Optional[str] = None
    zipcode: Optional[str] = None
    is_active: bool = True
    sort_order: int = 0


class PickupLocationPatchIn(BaseModel):
    name: Optional[str] = None
    label: Optional[str] = None
    address: Optional[str] = None
    note: Optional[str] = None
    pickup_time: Optional[str] = None
    area: Optional[str] = None
    zipcode: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None


class OrderItemIn(BaseModel):
    product_id: Optional[Union[int, str]] = None
    product_name: Optional[str] = None
    quantity: int = Field(ge=1)
    unit_price: Optional[float] = None


class OrderCreateIn(BaseModel):
    pickup_location_id: Optional[Union[int, str]] = None
    pickup_location_name: Optional[str] = None
    pickup_snapshot: Optional[Union[dict, list, str]] = None
    note: str = ""
    items: List[OrderItemIn]


class OrderStatusPatchIn(BaseModel):
    status: Literal["pending", "paid", "making", "ready", "completed", "cancelled"]


class OrderPaymentPatchIn(BaseModel):
    payment_status: Literal["non_paid", "paid", "refunded"]
    payment_method: Optional[Literal["cash", "venmo", "zelle", "alipay"]] = None
    payment_note: str = ""


class OrderCommentPatchIn(BaseModel):
    admin_comment: str = ""
