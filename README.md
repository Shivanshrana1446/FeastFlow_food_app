# FeastFlow — Online Food Ordering & Restaurant Management System

A full-stack, production-reviewed food ordering platform for four roles — **Customer**,
**Restaurant Owner**, **Delivery Partner**, and **Admin** — built as a MERN monorepo.

- **Backend**: Node.js, Express, MongoDB/Mongoose, JWT auth with rotating refresh tokens, Zod
  validation, Winston logging (stdout + file), Swagger docs, 89 Jest + Supertest tests, Dockerized.
- **Frontend**: React 19, Vite, Tailwind CSS v4, Redux Toolkit, Axios, React Hook Form + Zod,
  Framer Motion, role-based protected routing, 47 Vitest + React Testing Library tests — a
  hand-rolled component library, no UI kit.

For the deeper architecture write-up (database design, ER diagram, middleware pipeline, auth
strategy, and the order/delivery state machine), see **[ARCHITECTURE.md](./ARCHITECTURE.md)**.

---

## Table of contents

1. [Project features](#project-features)
2. [Folder structure](#folder-structure)
3. [Prerequisites](#prerequisites)
4. [Installation & environment setup](#installation--environment-setup)
5. [Running locally (without Docker)](#running-locally-without-docker)
6. [API summary](#api-summary)
7. [Deployment guide](#deployment-guide)
8. [Testing guide](#testing-guide)
9. [Troubleshooting](#troubleshooting)
10. [Future improvements](#future-improvements)

---

## Project features

| Role | Capabilities |
|---|---|
| **Customer** | Register/login, browse restaurants, search & filter food items (veg-only, price, sort), add to cart, place orders, mock online payment (card/UPI/wallet/COD), live order tracking, order history, ratings & reviews, saved address book, in-app notifications |
| **Restaurant Owner** | Restaurant CRUD + logo/cover image upload, menu (category + item) CRUD + image upload, order management (confirm → prepare → ready for pickup, or cancel), dashboard with revenue/order/rating analytics |
| **Delivery Partner** | Toggle availability & live location, browse and accept ready-for-pickup orders (claim-safe under concurrency), delivery lifecycle (picked up → out for delivery → delivered), delivery history |
| **Admin** | Platform dashboard & analytics, user management (activate/deactivate any account), restaurant approval workflow, oversee/manage all orders, manage delivery partners |

Cross-cutting: JWT access + rotating refresh tokens, role-based route protection on both ends,
pagination/search/sort on every list endpoint, rate limiting (stricter on auth routes), Helmet /
CORS / compression, a mock payment gateway with a simulated decline rate, an in-app notification
system, a full order/delivery state machine, and a WCAG-conscious UI (focus traps, keyboard
navigation, ARIA labeling, `prefers-reduced-motion` support). See
[ARCHITECTURE.md §7](./ARCHITECTURE.md#7-order--delivery-state-machine) for the state machine and
[ARCHITECTURE.md §8](./ARCHITECTURE.md#8-whats-intentionally-deferred) for deliberate scope cuts.

## Folder structure

```
foof_p/
├── ARCHITECTURE.md          # Full architecture, DB design, ER diagram, auth strategy
├── README.md                # You are here
├── docker-compose.yml       # Orchestrates mongo + backend + frontend
├── .env.example             # Root-level compose variables
├── postman/                 # Postman collection + environment
├── backend/                 # Express REST API
│   ├── src/                 # config, constants, models, middlewares, validations, services,
│   │                        # controllers, routes — see ARCHITECTURE.md §1 for the full tree
│   ├── scripts/seedAdmin.js # Bootstraps the first admin account (see below)
│   ├── tests/               # Jest + Supertest — 89 tests, unit + integration
│   ├── Dockerfile
│   └── docker-compose.yml   # Backend + Mongo only (no frontend) — for API-only development
└── frontend/                 # React 19 + Vite SPA
    ├── src/
    │   ├── api/              # axios-wrapped modules, one per backend resource
    │   ├── app/               # Redux store + typed hooks
    │   ├── components/        # ui/ (design system), layout/, common/, cart/, order/, restaurant/
    │   ├── features/          # Redux slices (auth, cart, ui)
    │   ├── hooks/              # useFetch, useToast
    │   ├── pages/               # public/, customer/, restaurantOwner/, delivery/, admin/
    │   ├── routes/              # ProtectedRoute / RoleRoute guards
    │   └── test/                 # Vitest setup
    ├── Dockerfile               # multi-stage: vite build -> nginx-unprivileged
    └── nginx.conf
```

Full annotated tree (every file, with its responsibility): **[ARCHITECTURE.md §1](./ARCHITECTURE.md#1-monorepo-folder-structure)**.

## Prerequisites

- **Node.js** ≥ 18 and npm (for running outside Docker)
- **MongoDB** ≥ 6 (local install, or the `mongo` service in `docker-compose.yml`)
- **Docker** & **Docker Compose** (for the containerized setup)

## Installation & environment setup

```bash
git clone <this-repo-url>
cd foof_p

cd backend && npm install
cd ../frontend && npm install
```

Three separate `.env.example` files exist, one per way of running the project. Copy whichever
applies and fill in real values — **never commit a real `.env` file.**

| File | When to use it |
|---|---|
| `backend/.env.example` → `backend/.env` | Running the backend directly with `npm run dev` |
| `frontend/.env.example` → `frontend/.env` | Running the frontend directly with `npm run dev` |
| `.env.example` (root) → `.env` (root) | Running everything with `docker compose up` |

Key variables:

| Variable | Where | Purpose |
|---|---|---|
| `MONGO_URI` | backend | MongoDB connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | backend | Must be ≥32 chars, random, and **different from each other** (`openssl rand -base64 48`) |
| `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | backend | Token lifetimes (defaults: `15m` / `7d`) |
| `CLIENT_URL` | backend | Origin allowed by CORS — must match where the frontend is served from |
| `ADMIN_BOOTSTRAP_SECRET` | backend | Optional. Set it to enable `POST /auth/bootstrap-admin` for creating the first admin account over HTTP (see [Creating an admin account](#creating-an-admin-account)). Unset = endpoint disabled |
| `VITE_API_URL` | frontend | Base URL the browser calls for the API. **Baked in at build time** (Vite), not read at runtime — rebuild the frontend image if this changes |
| `PORT` / `FRONTEND_PORT` | root (compose) | Host ports the API and frontend are published on |

## Running locally (without Docker)

Requires a MongoDB instance reachable at the `MONGO_URI` you configure.

```bash
# Terminal 1 — backend (http://localhost:5000)
cd backend
npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd frontend
npm run dev
```

Visit `http://localhost:5173`. Swagger UI is at `http://localhost:5000/docs`.

### Creating an admin account

Admins can't self-register through the signup form by design — there's no public "become an
admin" option (see [ARCHITECTURE.md §6](./ARCHITECTURE.md#6-authentication-strategy)). Two ways to
create one, depending on whether you have shell access to the backend:

**Option A — HTTP endpoint (no shell access needed; use this for Render, or anywhere you can't run
a script directly).** Set `ADMIN_BOOTSTRAP_SECRET` to a long random value
(`openssl rand -base64 32`) in the backend's environment, then call:

```bash
curl -X POST https://your-backend.onrender.com/api/v1/auth/bootstrap-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Site Admin",
    "email": "admin@example.com",
    "password": "a-strong-password",
    "secret": "the-ADMIN_BOOTSTRAP_SECRET-value-you-set"
  }'
```

It responds exactly like login/register — an admin user plus an access token, so you're logged in
immediately. It's idempotent and secret-gated with a constant-time comparison: safe to re-run, it
creates the admin if missing or promotes an existing account with that email to `admin` without
touching that account's password. Leaving `ADMIN_BOOTSTRAP_SECRET` unset disables the endpoint
entirely (it always 403s) — worth doing once you've created the admin(s) you need, since the
secret is effectively a root credential for as long as it's set.

**Option B — seed script (when you do have shell access, e.g. local dev or Docker):**

```bash
cd backend
ADMIN_NAME="Site Admin" ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD="a-strong-password" npm run seed:admin
```

Same idempotent create-or-promote behavior. Under Docker, run it inside the running backend
container instead: `docker compose exec backend node scripts/seedAdmin.js` (with the same env vars
passed via `-e`).

## Running with Docker

Builds and runs all three services — MongoDB, the API, and the frontend served by Nginx — from a
single compose file at the repo root.

```bash
cp .env.example .env    # fill in real JWT secrets
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:8080 |
| Backend API | http://localhost:5000/api/v1 |
| Swagger UI | http://localhost:5000/docs |
| MongoDB | mongodb://localhost:27017 |

To run just the API + MongoDB (no frontend container), use `backend/docker-compose.yml` instead:

```bash
cd backend
cp .env.example .env
docker compose up --build
```

Stop everything with `docker compose down` (add `-v` to also drop the Mongo data volume).

> **Note on `VITE_API_URL`**: since Vite inlines environment variables at build time, changing
> where the API lives after the frontend image is already built requires a rebuild:
> `docker compose build --build-arg VITE_API_URL=https://your-api.example.com/api/v1 frontend`.

Both compose files were verified with real `docker compose build` + `up` runs: all services
(mongo, backend, frontend) report `healthy`, the backend's health check confirms a live DB
connection, and structured JSON logs stream to `docker compose logs` (stdout is the primary sink;
`backend/logs/*.log` inside the container is a secondary copy, not the only copy).

## API summary

Base path: `/api/v1`. Every list endpoint supports **pagination** (`page`, `limit`), **search**
(`q`) and **sorting** (`sortBy=field:asc|desc`).

| Resource | Endpoints | Roles |
|---|---|---|
| Auth | `POST /auth/register`, `/login`, `/refresh-token`, `/logout`; `GET /auth/me`; `POST /auth/bootstrap-admin` (secret-gated, disabled unless configured) | public / authenticated |
| Users | `GET/PATCH /users/:id`; `POST/PATCH/DELETE /users/me/addresses[/:id]` | self, admin |
| Restaurants | `GET /restaurants` (search, filter, geo), `/restaurants/mine`, `/:id`, `/:id/menu`; `POST/PATCH/DELETE /restaurants[/:id]`; `PATCH /:id/images`; `GET /:id/dashboard` | public / owner, admin |
| Categories | `GET /categories?restaurant=:id`; `POST/PATCH/DELETE /categories[/:id]` | public / owner, admin |
| Menu Items | `GET /menu-items` (search, filters), `/:id`; `POST/PATCH/DELETE /menu-items[/:id]`; `PATCH /:id/image` | public / owner, admin |
| Cart | `GET/DELETE /cart`; `POST/PATCH/DELETE /cart/items[/:itemId]` | customer |
| Orders | `POST /orders` (checkout); `GET /orders`, `/:id` (role-scoped); `PATCH /:id/status` | customer / owner, admin |
| Payments | `GET /payments/:id` | order owner, admin |
| Reviews | `GET /reviews?restaurant=:id`; `POST /reviews` (delivered orders only) | public / customer |
| Delivery | `GET/PATCH /delivery/profile`, `/availability`, `/location`; `GET /delivery/orders/available`, `/assigned`, `/history`; `PATCH /delivery/orders/:id/accept`, `/picked-up`, `/out-for-delivery`, `/delivered` | deliveryPartner |
| Admin | `GET /admin/dashboard`; `GET/PATCH /admin/users[/:id/status]`; `GET/PATCH /admin/restaurants[/:id/approve]`; `GET /admin/delivery-partners` | admin |
| Notifications | `GET /notifications`; `PATCH /:id/read`, `/read-all` | authenticated |
| Docs / Health | `GET /docs` (Swagger UI), `GET /health` | public |

- **Full endpoint reference & request/response shapes**: [ARCHITECTURE.md §4](./ARCHITECTURE.md#4-api-structure).
- **Live, testable docs**: `http://localhost:5000/docs` once the backend is running — authorize
  with a Bearer token from `POST /auth/login`.
- **Postman**: import [`postman/FeastFlow.postman_collection.json`](./postman/FeastFlow.postman_collection.json)
  and [`postman/FeastFlow.postman_environment.json`](./postman/FeastFlow.postman_environment.json).
  Organized to run top-to-bottom (Auth → Restaurants → Categories → Menu Items → Cart → Orders →
  Delivery → Reviews → Notifications → Admin); requests that create a resource save its id into an
  environment variable automatically.
- **Database schema & ER diagram**: [ARCHITECTURE.md §2](./ARCHITECTURE.md#2-database-design-mongodb-normalized-where-relationships-are-queried-independently).
  Mongoose schemas themselves are the source of truth: `backend/src/models/*.model.js`.

## Deployment guide

1. **Database**: use a managed MongoDB (e.g. Atlas) in production rather than the compose `mongo`
   service; set `MONGO_URI` to that connection string, and make sure the indexes defined on each
   model are built (Mongoose builds them automatically on connect in a fresh database).
2. **Secrets**: generate strong, distinct values for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`
   (`openssl rand -base64 48`, ≥32 characters — the app refuses to boot with anything shorter).
   Never reuse the placeholder values in `.env.example`.
3. **Backend**: build and push the image (`docker build -t your-registry/feastflow-backend
   ./backend`), deploy it to your container platform of choice (ECS, Cloud Run, a VM with Docker,
   etc.), and set the environment variables from the table above — especially `CLIENT_URL`
   pointing at your real frontend domain (CORS rejects requests otherwise, and the app now fails
   to start in production if `CLIENT_URL` is missing).
4. **Bootstrap the first admin**: after the backend is up, either call `POST
   /auth/bootstrap-admin` or run `seedAdmin.js` once (see [above](#creating-an-admin-account)) —
   there is no admin account until you do this. On platforms with no shell access (Render's free
   tier, for example), the HTTP endpoint is the only option of the two that works.
5. **Frontend**: build with the production API URL baked in: `docker build --build-arg
   VITE_API_URL=https://api.yourdomain.com/api/v1 -t your-registry/feastflow-frontend
   ./frontend`, then deploy the resulting Nginx image (or deploy `frontend/dist` to any static
   host — Netlify, Vercel, S3+CloudFront — since it's a plain SPA build).
6. **Uploads**: the backend stores uploaded images on local disk (`backend/uploads`, mounted as a
   named Docker volume in `docker-compose.yml` so it survives container recreation). In a
   multi-instance or ephemeral-filesystem deployment, mount a shared/persistent volume or switch
   `middlewares/upload.middleware.js` to an object-storage backend (S3, GCS, etc.) — see
   [Future improvements](#future-improvements).
7. **Logging**: the backend logs structured JSON to stdout in production (in addition to
   `logs/*.log` inside the container) specifically so container platforms — Docker, ECS,
   Kubernetes, CloudWatch, etc. — can collect it without extra configuration.
8. **HTTPS**: terminate TLS in front of both services (a load balancer or reverse proxy) — neither
   the Express app nor the Nginx image handles TLS itself.
9. **CORS**: `CLIENT_URL` on the backend must exactly match the frontend's public origin.

### Deploying to Render + Vercel + Atlas (this project's target stack)

A `render.yaml` [Blueprint](https://render.com/docs/blueprint-spec) is included at the repo root
so the backend deploys with one pass through Render's UI instead of manually filling in every
field. Order matters — the backend needs to exist before the frontend can be built against it, and
the backend needs the frontend's final URL for CORS:

1. **Atlas**: already covered above — `MONGO_URI` should look like
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/food_ordering_db?retryWrites=true&w=majority`.
   In Atlas's Network Access tab, allow access from `0.0.0.0/0` (Render's outbound IPs aren't
   static on the free plan) or add Render's specific egress IPs if you're on a paid Atlas tier that
   supports IP allowlisting more strictly.
2. **Backend on Render**: push `render.yaml` to `main` (already there once you push this change),
   then in the Render dashboard: **New → Blueprint** → connect the `FeastFlow_food_app` repo →
   Render reads `render.yaml` and creates the `feastflow-backend` web service. It'll prompt you for
   the two variables marked `sync: false` — paste in `MONGO_URI` now; leave `CLIENT_URL` blank for
   a moment (step 4). `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `ADMIN_BOOTSTRAP_SECRET` are
   auto-generated by Render — you don't need to create these yourself, just note
   `ADMIN_BOOTSTRAP_SECRET`'s generated value from the service's **Environment** tab for step 5.
   Once deployed, confirm `https://<your-service>.onrender.com/api/v1/health` returns `200`.
3. **Frontend on Vercel**: **Add New → Project** → import the same repo → set **Root Directory** to
   `frontend` (Vercel auto-detects the Vite framework preset from there) → under **Environment
   Variables** add `VITE_API_URL` = `https://<your-render-service>.onrender.com/api/v1` (must be
   set *before* the first build — Vite bakes it in at build time) → Deploy.
4. **Close the CORS loop**: back on Render, set the backend's `CLIENT_URL` to the Vercel URL from
   step 3 (e.g. `https://feastflow.vercel.app`) and trigger a redeploy (Render redeploys
   automatically on an env var change for most plans; use **Manual Deploy** if not).
5. **Bootstrap the admin account**: `POST https://<your-render-service>.onrender.com/api/v1/auth/bootstrap-admin`
   with the `ADMIN_BOOTSTRAP_SECRET` value from step 2 — see
   [Creating an admin account](#creating-an-admin-account) for the exact request shape. Once you've
   created the admin(s) you need, delete the `ADMIN_BOOTSTRAP_SECRET` env var on Render to close
   the endpoint.
6. **Know the free-tier tradeoffs**: Render's free web services spin down after 15 minutes of
   inactivity (the first request after that takes 30–60s to wake it back up), and — more
   importantly — **local disk storage does not persist across deploys or restarts on Render's free
   tier**, so anything written to `backend/uploads` (restaurant logos, menu item images) is lost
   whenever the service redeploys or spins down/up. This project stores uploads on local disk by
   design (see [Future improvements](#future-improvements)); for anything beyond a demo, move
   `middlewares/upload.middleware.js` to S3/Cloudinary/GCS before uploaded images matter to you.

## Testing guide

### Backend — Jest + Supertest

```bash
cd backend
npm test               # full suite: 89 tests across 16 suites
npm run test:coverage  # with a coverage report
```

Unit tests cover pure logic in isolation (order pricing math, the order state machine, the mock
payment gateway). Integration tests boot the real Express app against an in-memory MongoDB
(`mongodb-memory-server` — no external database needed) and drive full multi-role HTTP flows:
auth, users, restaurants (including the approval-gated search fix and ownership-checked image
uploads), menu items, cart, the full order lifecycle across all four roles, payments, delivery
(including concurrent-accept race-condition tests), notifications, and admin.

### Frontend — Vitest + React Testing Library

```bash
cd frontend
npm test          # full suite: 47 tests across 8 files
npm run test:watch
```

Covers Redux slice reducers (`cartSlice`, `authSlice`), pure utilities (`format.js`), and
component behavior for the shared UI primitives most exercised across the app — `Button`,
`StatusBadge`, `EmptyState`, `StarRating` (read-only vs. interactive `radiogroup` modes), and
`Modal` (focus-trap, Escape-to-close, focus restoration on close).

### Full-stack verification performed this pass

Beyond the automated suites, the assembled system was verified end-to-end against real Docker
containers (not the in-memory test database): both compose files build and start with all
services reporting `healthy`; a scripted API smoke test drove the entire golden path — register
all three self-registerable roles, seed an admin, create and approve a restaurant, build a menu,
search for it publicly, add to cart, save an address, check out with the mock payment gateway,
advance an order through every status as the owner and then the delivery partner, view order
history, leave a review, and confirm the order shows up in the admin dashboard's analytics.

There is currently no automated browser (Playwright/Cypress) suite — see
[Future improvements](#future-improvements).

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Backend fails to start with a Zod/env error | A required `.env` variable is missing, or a JWT secret is under 32 characters — check against `backend/.env.example` |
| Frontend calls fail with CORS errors | `CLIENT_URL` on the backend doesn't match the frontend's actual origin |
| Frontend calls hit the wrong API URL after a Docker rebuild | `VITE_API_URL` is a build-time value — rebuild the frontend image, don't just restart the container |
| `docker compose up` fails immediately on `backend` | Root `.env` is missing `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` — compose is configured to fail fast rather than silently run with an insecure default |
| Can't log in as admin | No admin exists yet on a fresh database — call `POST /auth/bootstrap-admin` or run `npm run seed:admin` (see [above](#creating-an-admin-account)) |
| `POST /auth/bootstrap-admin` always returns 403 | `ADMIN_BOOTSTRAP_SECRET` isn't set on the backend, or the `secret` field in your request doesn't match it exactly |
| Checkout randomly fails with "Payment failed" | Expected — the mock payment gateway simulates an ~8% decline rate for non-Cash-on-Delivery methods; just retry |
| Image uploads 400 | Only JPEG/PNG/WEBP under 2MB are accepted (`middlewares/upload.middleware.js`) |
| `docker compose logs backend` shows nothing | Fixed in this pass — older images only logged to a file in production; rebuild the backend image to pick up stdout logging |

## Future improvements

Deliberate scope cuts and genuine next steps, not oversights:

- **Real payment gateway** — checkout currently uses a simulated gateway (`utils/mockPaymentGateway.js`)
  with an instant paid/declined result (or "pending" until delivery for Cash on Delivery). Swapping
  in Stripe/Razorpay would mean adding a webhook endpoint and moving payment-status transitions
  out of the request/response cycle.
- **Object storage for uploads** — images are stored on local disk under `backend/uploads`
  (persisted via a named Docker volume). Fine for a single instance; a multi-instance or
  ephemeral-filesystem deployment should move this to S3/GCS/Cloudinary.
- **Distance-based delivery pricing & a coupon engine** — `deliveryFee` is currently a flat
  constant, and `pricing.discount` exists on the Order model but nothing populates it yet.
- **Push/email/SMS notifications** — notifications are in-app only today (stored in the
  `notifications` collection, polled by the frontend). Wiring a real delivery channel (SES,
  Twilio, web push) would need a queue so it doesn't block the request that triggers it.
- **Live order tracking over WebSockets/SSE** — the frontend currently polls for order status
  updates; a push-based channel would reduce latency and request volume for active orders.
- **Automated browser E2E suite** — Playwright/Cypress covering the full golden path per role
  would close the gap between the manual/scripted smoke test performed this pass and true CI
  regression coverage.
- **`oxlint` in the frontend toolchain** — the configured `npm run lint` currently reports "no
  files found" in this environment (an oxlint 1.x/Windows path-resolution issue reproduced even
  with zero spaces in the working directory), unrelated to the project's own code. Dead-code and
  style checks were done manually (grep-based sweeps) as a substitute; worth revisiting with a
  newer oxlint release or falling back to ESLint for the frontend as well.
- **Per-user (not just per-IP) rate limiting** — the current limiter is IP-based, which is the
  right default for unauthenticated auth routes but coarser than necessary for authenticated
  traffic behind a shared NAT/proxy.
