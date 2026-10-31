# API reference

Base URL (local): `http://localhost:4000`  
Storefront proxies `/api/*` via Next.js rewrites.

## Health

- `GET /health` — `{ status, db, cloudinary }`

## Public

- `GET /api/products` — query: `category`, `collection`
- `GET /api/products/:slug`
- `GET /api/categories`
- `GET /api/categories/:slug`
- `GET /api/collections`
- `GET /api/collections/:slug`
- `GET /api/banners`
- `GET /api/settings/public`
- `POST /api/checkout` — body: checkout schema (server-priced)
- `GET /api/orders/:orderNumber` — limited public fields

## Admin (session cookie + CSRF)

Fetch `GET /api/admin/csrf` first; send `x-csrf-token` on mutating requests.

- `POST /api/admin/login` / `POST /api/admin/logout`
- `GET /api/admin/me`
- `POST /api/admin/change-password`
- `GET /api/admin/dashboard`
- CRUD: products, categories, collections, banners
- `GET|PUT /api/admin/settings`
- `GET /api/admin/orders`, `GET /api/admin/orders/:id`
- `PATCH /api/admin/orders/:id/status`
- `GET /api/admin/uploads/sign` — Cloudinary signed params

Audit log API removed (Neon free-tier trim).
