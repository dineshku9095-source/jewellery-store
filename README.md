# Jewellery Store

Production monorepo for a guest-checkout jewellery storefront with WhatsApp order handoff and an admin back office.

## Packages

| Path | Description |
|------|-------------|
| `frontend/` | Next.js App Router storefront + admin (Refine Gilt theme) |
| `backend/` | Express REST API, Prisma, PostgreSQL sessions |
| `shared/` | Zod schemas, decimal-safe money, WhatsApp helpers |
| `docs/` | Architecture, API, deployment, and ops guides |

## Quick start

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
# Set DATABASE_URL and ADMIN_BOOTSTRAP_* in backend/.env

npm install
npm run build -w @jewellery/shared
npm run db:generate
npm run db:migrate:dev
npm run db:seed

npm run dev:backend   # http://localhost:4000
npm run dev:frontend  # http://localhost:3000
```

- Storefront: http://localhost:3000  
- Admin: http://localhost:3000/admin/login  

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for Render and production setup.

## Business rules

- Guests browse, cart, and checkout — no customer accounts.
- Admin-only login (Argon2id, HTTP-only sessions in PostgreSQL).
- Checkout prices are calculated on the server; orders start as **WhatsApp Pending** with a prefilled `wa.me` link — never auto-delivered.
- No payment gateway; payment is arranged with the shop manually.
