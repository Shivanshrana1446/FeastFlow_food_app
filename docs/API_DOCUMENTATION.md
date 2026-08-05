# API Documentation

Base path: `/api/v1`. Every list endpoint supports **pagination** (`page`, `limit`), **search**
(`q` on indexed text fields), and **sorting** (`sortBy=field:asc|desc`) via the shared
`paginate()` utility.

Three ways to explore this API, in order of how much setup they need:

1. **Live, interactive Swagger UI** — `http://localhost:5000/docs` (or your deployed backend's
   `/docs`). Every route below is annotated with `@openapi` JSDoc in its controller/route file, so
   this is always in sync with the code. Click **Authorize** and paste a Bearer token from
   `POST /auth/login` to try authenticated routes directly from the browser.
2. **[Postman collection](./postman/)** — pre-built requests for every endpoint, organized to run
   top-to-bottom, with an environment that auto-captures ids (`restaurantId`, `orderId`, etc.) as
   you go.
3. **This file** — a flat reference table when you just need to know what exists.

All endpoints below are fully implemented — nothing here is a stub.

## Auth

| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/auth/register` | public | `role` is `customer`, `restaurantOwner`, or `deliveryPartner` — `admin` is not a selectable role here |
| POST | `/auth/login` | public | Returns an access token + sets an `httpOnly` refresh cookie |
| POST | `/auth/refresh-token` | public (needs the refresh cookie) | Rotates the refresh token |
| POST | `/auth/logout` | authenticated | Invalidates the refresh token |
| GET | `/auth/me` | authenticated | Current user's profile |
| POST | `/auth/bootstrap-admin` | secret-gated | Creates/promotes an admin account over HTTP; disabled unless `ADMIN_BOOTSTRAP_SECRET` is set. See [../README.md](../README.md#creating-an-admin-account) |

## Users

| Method | Path | Access | Notes |
|---|---|---|---|
| GET / PATCH | `/users/:id` | self, admin | Profile fetch/update |
| PATCH | `/users/me/avatar` | authenticated | Multipart upload → Cloudinary |
| POST / PATCH / DELETE | `/users/me/addresses[/:addressId]` | authenticated | Own address book |

## Restaurants

| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/restaurants` | public | Search `q`, filter `cuisine`/`city`/`isOpen`, sort, paginate, geo via `lat`/`lng`/`radiusKm`. Only returns `isApproved: true` restaurants |
| GET | `/restaurants/mine` | restaurantOwner, admin | Owner's own restaurants, including unapproved (dashboard use) |
| GET | `/restaurants/:id`, `/restaurants/:id/menu` | public | |
| POST / PATCH / DELETE | `/restaurants[/:id]` | restaurantOwner, admin | |
| PATCH | `/restaurants/:id/images` | owner, admin | Multipart `logo` + `cover` fields → Cloudinary |
| GET | `/restaurants/:id/dashboard` | owner, admin | Orders by status, revenue, top items, rating |

## Categories & Menu Items

| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/categories?restaurant=:id` | public | |
| POST / PATCH / DELETE | `/categories[/:id]` | owner, admin | |
| GET | `/menu-items` | public | Search `q`, filter `restaurant`/`category`/`isVeg`/price range, sort, paginate — cross-restaurant search only surfaces items from approved restaurants |
| GET | `/menu-items/:id` | public | |
| POST / PATCH / DELETE | `/menu-items[/:id]` | owner, admin | |
| PATCH | `/menu-items/:id/image` | owner, admin | Multipart `image` → Cloudinary |

## Cart & Orders

| Method | Path | Access | Notes |
|---|---|---|---|
| GET / DELETE | `/cart` | customer | |
| POST / PATCH / DELETE | `/cart/items[/:itemId]` | customer | |
| POST | `/orders` | customer | Checkout. For `paymentMethod: "razorpay"`, also creates a Razorpay order and returns it + the public key id for the frontend to open Checkout with |
| GET | `/orders`, `/orders/:id` | customer, owner, deliveryPartner, admin | Role-scoped (own / own-restaurant / assigned / all). `/:id` includes the linked payment |
| PATCH | `/orders/:id/status` | restaurantOwner, admin | confirm → preparing → readyForPickup, or cancel |

## Payments

| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/payments/:id` | order owner, admin | |
| POST | `/payments/razorpay/verify` | authenticated (payment owner) | HMAC-SHA256 verifies `{razorpayOrderId, razorpayPaymentId, razorpaySignature}` against `RAZORPAY_KEY_SECRET`; marks the payment `paid` |

## Reviews

| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/reviews?restaurant=:id` | public | |
| POST | `/reviews` | customer | Delivered orders only, one review per order |

## Delivery

| Method | Path | Access | Notes |
|---|---|---|---|
| GET / PATCH | `/delivery/profile`, `/delivery/availability`, `/delivery/location` | deliveryPartner | Profile auto-created on first access |
| GET | `/delivery/orders/available`, `/delivery/orders/assigned`, `/delivery/orders/history` | deliveryPartner | |
| PATCH | `/delivery/orders/:id/accept` | deliveryPartner | Atomic claim — 409 if another partner already accepted it |
| PATCH | `/delivery/orders/:id/picked-up`, `/out-for-delivery`, `/delivered` | deliveryPartner | Must be the order's assigned partner |

## Admin

| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/admin/dashboard` | admin | Platform-wide analytics: users by role, restaurant approval counts, orders by status, revenue |
| GET / PATCH | `/admin/users`, `/admin/users/:id/status` | admin | List (filter/search/paginate), activate/deactivate |
| GET / PATCH | `/admin/restaurants`, `/admin/restaurants/:id/approve` | admin | List (incl. unapproved), approve/revoke |
| GET | `/admin/delivery-partners` | admin | |

"Manage Foods"/"Manage Orders" for admin reuse the same menu-item and order endpoints above —
admin is granted a bypass in each service's ownership check rather than duplicating a parallel set
of `/admin/*` CRUD routes.

## Notifications

| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/notifications` | authenticated | Paginated, `meta.unreadCount` |
| PATCH | `/notifications/:id/read`, `/notifications/read-all` | authenticated | |

## Docs & Health

| Method | Path | Access |
|---|---|---|
| GET | `/docs` | public (Swagger UI) |
| GET | `/health` | public |

---

A generated static copy of the OpenAPI 3.0 spec (same one that powers `/docs`) is checked in at
[openapi.json](./openapi.json) for offline reference or import into other tools (Insomnia, Postman
itself, an IDE's REST client, etc.). It's a build artifact — regenerate it after changing any
`@openapi` JSDoc comment:

```bash
cd backend
node -e "require('dotenv').config(); require('fs').writeFileSync('../docs/openapi.json', JSON.stringify(require('./src/config/swagger'), null, 2))"
```
