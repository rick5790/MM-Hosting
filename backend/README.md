# Makkie Admin Backend

This backend matches the API surface the current website already expects and adds the admin-side order and payment endpoints you asked for.

## Stack

- FastAPI
- SQLAlchemy
- SQLite for local development by default
- MySQL on Lightsail via `mysql+pymysql://...`

## Quick Start

```bash
cd backend
python3 -m pip install -r requirements.txt
cp .env.example .env
python3 -m app.bootstrap
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8787
```

Then open:

- `http://localhost:8787/admin/` for the admin UI
- `http://localhost:8787/health` for API health

## Lightsail Database

Set `DATABASE_URL` to your real database. Example:

```bash
DATABASE_URL=mysql+pymysql://USER:PASSWORD@HOST:3306/DB_NAME?charset=utf8mb4
```

## Main Endpoints

- `POST /api/auth/local-login`
- `POST /api/auth/local-check`
- `POST /api/admin/login`
- `GET /api/weekly-order`
- `GET /api/products`
- `GET /api/pickup-locations`
- `POST /api/orders`
- `PATCH /api/admin/weekly-order`
- `GET /api/admin/orders`
- `GET /api/admin/orders/{order_id}`
- `PATCH /api/admin/orders/{order_id}/status`
- `PATCH /api/admin/orders/{order_id}/payment`
- `PATCH /api/admin/orders/{order_id}/comment`
- `GET /api/admin/stats`
- `GET /api/admin/users`
- `GET /api/admin/analytics/members`
- `GET /api/admin/weekly-order`
- `GET /api/admin/products`
- `POST /api/admin/products`
- `PATCH /api/admin/products/{product_id}`
- `DELETE /api/admin/products/{product_id}`
- `POST /api/admin/products/{product_id}/image`
- `GET /api/admin/pickup-locations`
- `POST /api/admin/pickup-locations`
- `PATCH /api/admin/pickup-locations/{pickup_id}`

## Notes

- Orders store product and pickup snapshots so historical orders stay accurate after edits.
- `payment_status` supports `non_paid`, `paid`, and `refunded`.
- `payment_method` supports `cash`, `venmo`, `zelle`, and `alipay`.
- The current website still hardcodes `https://api.makkiemua.com`, so once this backend is deployed there, the existing frontend should start talking to it without major rewiring.
