# Backend / environment notes

## Environment map (verified via SSH 2026-07)
- **Live server:** `ssh -i ~/.ssh/makkie_lightsail ubuntu@52.13.201.129` (Lightsail, pm2).
  - `admin.makkiemua.com` → :3001 → `~/makkie-web-api` (Node). Customer API base points here.
    Generates `group_order_number` correctly. Its `public-admin/admin.js` is an OLD 563-line
    admin UI (the repo's `backend/admin_ui/admin.js` is the newer 1200+ line version).
  - `api.makkiemua.com` → :3000 → `~/makkie-api` (Node, older).
  - Neither is a git repo. **"后台我不管" → do not hand-edit the live server.**
- **Local dev backend:** Python FastAPI in `backend/app/main.py`, served at 127.0.0.1:8787.
  This is what the owner develops against (matches the screenshots). It generates
  `MM{yymmdd}{id}` order numbers (`make_order_no`, main.py:186) and did NOT expose a
  user-orders GET route.

## Done in this repo (frontend + admin UI + local Python backend)
- **Customer "看不到订单" fix:** added `GET /api/orders/user/{user_id}` to the Python backend
  (`backend/app/main.py`) — read-only, also computes per-group sequence (1号) so the number
  shows correctly locally. Production makkie-web-api already had this route. Frontend
  `loadUserOrders()` now calls `/api/orders/user/:id`.
- **Order number 1号:** admin UI computes a per-group sequence client-side
  (`getGroupSequenceNumber`) as a fallback when `group_order_number` is absent, so it shows
  1号 even against the local MM-number backend.
- **Revenue = completed only:** admin computes revenue client-side from loaded orders
  (`getCompletedRevenueTotal` / per user / per product / per group) — no backend change.
- **历史团购 tab** with per-group completed revenue + a CSS bar chart.

## Still needs real backend work (not in repo / owner's call)
The deployed backend is **not fully in this repo** — only a partial snapshot lives in
`.remote-staging/makkie-web-api/`.

---

## 1. Customer "我的订单" — make sure `GET /api/orders` returns the signed-in user's orders

**Why:** The customer site now has a "我的订单" page that calls `GET /api/orders`
(authenticated with the Bearer token from `/api/auth/local-login`). It expects an array
of orders (or `{ orders: [...] }`), each including at least:
`id, group_order_number, status, payment_status, total_amount, items[], pickup_time,
pickup_snapshot` (or `pickup{}`), `created_at`.

**Action:**
- Confirm a route `GET /api/orders` exists and is wired to
  `orderService.getOrdersByUser(req.user.id)` (see
  [.remote-staging/.../orderService.js:267](.remote-staging/makkie-web-api/services/orderService.js#L267)).
  The staging snapshot is missing `routes/orderRoutes.js` — verify the live one has the
  GET handler, not just POST.
- The decorated order already includes `group_order_number`, `status`, `items`, `pickup`.
  Add `payment_status` to the customer payload only if you want customers to see it
  (frontend shows it only when present).

**Root cause of "我已经下过单了，为什么看不到？":** identity is per-browser
`client_id` (`web_<ts>_<rand>` in localStorage → `openid = local:<client_id>`). An order
placed under one browser/device won't appear under another. Real login (item 3) fixes
this permanently.

---

## 2. Weekly order number (1, 2, 3 …) — already mostly implemented, just confirm

**Status:** The backend **already** assigns a per-group sequential number that resets
each weekly group:
- `getNextGroupOrderNumber(groupId)` →
  [orderService.js:132](.remote-staging/makkie-web-api/services/orderService.js#L132)
- Stored as `orders.group_order_number`, returned as `group_order_number` /
  `groupOrderNumberText` ("N号").
- Backfill migration exists in
  [db.js:111](.remote-staging/makkie-web-api/db.js#L111).

**Action:** Just ensure the **live** DB has the `group_order_number` column + the backfill
ran, and that both `GET /api/orders` (customer) and `GET /api/admin/orders` include
`group_order_number`. The UI now displays it as **1号 / #1** and no longer relies on the
long `MM…` id. No new backend code needed if the live version matches staging.

---

## 3. Google login — ✅ DONE (2026-07-02), plus guest-nickname login

Implemented on BOTH backends + frontend:
- **Live Node (makkie-web-api)**: `POST /api/auth/google` (verifies GIS credential via
  google-auth-library, upserts user `openid = google:<sub>`), `POST /api/auth/guest`
  (nickname 1–30 chars, reuses browser client_id so guest history persists),
  `GET /api/me` + `/api/auth/me`, `POST /api/logout`. Sets httpOnly `makkie_token` cookie
  (Secure, SameSite=Lax, 7d) AND returns the existing HMAC Bearer token — old auth flow
  untouched. CORS: explicit origin whitelist + credentials. users table gained
  google_id/email/name/picture/login_type/last_login_at via ensureColumn.
  Backup of replaced files: `~/backups/pre-google-20260702/`. Deployed + pm2 restarted.
- **Local FastAPI**: same four endpoints; Google verify via tokeninfo endpoint (no new
  pip dep); guest reuses Customer/client_id model. CORS switched to explicit origins.
- **Frontend**: profile overlay = login view (GIS button + nickname + Continue as guest)
  or account view (avatar, name, 我的订单, 退出登录); `/api/me` restore on refresh;
  explicit-login flag in localStorage `makkie.web.loginMode`.
- **Remaining**: paste the real GOOGLE_CLIENT_ID into `assets/shop-page.js`
  (GOOGLE_CLIENT_ID const), server `~/makkie-web-api/.env`, local `backend/.env`.
  Deviations from original spec: token is existing HMAC (not jsonwebtoken); API base is
  admin.makkiemua.com (api.makkiemua.com is the OLD app).

### Original assessment (kept for reference)

The users table already keys identity by `openid` (currently `local:<clientId>`), so Google
slots in cleanly as `google:<sub>`.

**Backend steps:**
1. `npm i google-auth-library`.
2. New endpoint `POST /api/auth/google { id_token }`:
   - Verify token with `OAuth2Client(GOOGLE_CLIENT_ID).verifyIdToken(...)`.
   - `const { sub, name, picture, email } = payload`.
   - Upsert user with `openid = "google:" + sub` (reuse the `upsertLocalUser` pattern in
     [authService.js:58](.remote-staging/makkie-web-api/services/authService.js#L58)).
   - Return `{ token: createToken(user.id), user: normalizeUser(user) }`.
3. (Optional) Account merge: if the browser already has a `local:<clientId>` user with
   orders, re-point those orders' `user_id` to the Google user on first Google login, so
   guest history follows them.
4. Config: add `GOOGLE_CLIENT_ID` to env; create an OAuth 2.0 Web client in Google Cloud
   and authorize the site origin.

**Frontend steps (not yet done — needs the endpoint first):**
- Load `https://accounts.google.com/gsi/client`, render the Google button (e.g. in the
  profile overlay), receive the credential (ID token), POST it to `/api/auth/google`, then
  `saveSiteAuth(data)` and re-render. This replaces/augments the anonymous
  `ensureGuestAuth()` flow in `assets/shop-page.js`.

---

## Done in this repo (frontend + admin UI), no backend needed
- Admin tabs: `本周团购管理` (weekly editor) + separate `本周订单` tab with a production
  summary ("本周要做什么" — product × total qty) and expand/collapse per order.
- Chinese status labels everywhere (admin + customer). Status values in the DB stay
  English (`pending/paid/making/ready/completed/cancelled`); only the display is localized.
- Customer "我的订单" is a standalone full-screen view (not a centered popup), shows active
  vs past orders, order status (green when `completed`), 1号/#1 number, and pickup address
  as an Apple/Google Maps link.
