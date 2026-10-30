# Architecture

## Monorepo

```
/agent
├── frontend/   Next.js 14 App Router, Tailwind, guest cart (localStorage)
├── backend/    Express + Prisma + PostgreSQL
├── shared/     Zod schemas, money, WhatsApp, order status rules
└── docs/
```

## Request flow

1. Browser loads Next.js (`jewellery-web`).
2. Storefront data: server components call `BACKEND_URL` or browser calls same-origin `/api` (rewrite to API).
3. Checkout: `POST /api/checkout` validates stock, computes totals, creates `WHATSAPP_PENDING` order, returns `wa.me` URL.
4. Admin: session token in HTTP-only cookie; CSRF on writes; sessions stored in `AdminSession`.

## Data

PostgreSQL via Prisma. Money stored as `Decimal(12,2)`. Order line items snapshot names/prices at purchase time.

## Security

- Argon2id passwords
- Rate limits on login and checkout
- Helmet + CORS with credentials
- No customer auth surface
