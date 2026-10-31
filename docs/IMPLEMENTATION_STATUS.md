# Implementation status

Last updated: 2026-10-31

## Summary

| Area | Status |
|------|--------|
| Monorepo scaffold | Done |
| Prisma schema + migration + seed | Done |
| Backend REST API + auth + checkout | Done |
| Shared Zod / money / WhatsApp helpers | Done |
| Storefront (Queen's Jewels Aura green theme) | Done |
| Admin UI (full CRUD + publish toggles) | Done — see [ADMIN_CRUD.md](./ADMIN_CRUD.md) |
| Cloudinary signed upload + best-effort destroy | Done |
| Unit tests (money, WhatsApp) | Done |
| Docs + render.yaml + .env.example | Done |

## Business rules

- Guest browse / cart / checkout — no customer auth
- Admin-only login (Argon2id, HTTP-only session cookies, DB sessions)
- Login + API rate limits; CSRF on admin mutating routes
- Server-side price calculation; WhatsApp Pending orders; `wa.me` handoff
- No payment gateway; payment arranged with the shop
- Order status machine with manual admin transitions
- Decimal-safe money; Cloudinary sign endpoint
- Admin bootstrap from `ADMIN_BOOTSTRAP_*`

## Public routes

Home, shop, categories, collections, PDP, cart, checkout, order success, about, contact, FAQ, shipping, privacy, terms.

## Admin routes

Login, dashboard, products, categories, collections, banners, orders (+ detail), settings, profile.
(Audit log UI/API removed for Neon free tier.)

## Live GitHub (JE-2)

- Repo: https://github.com/dineshku9095-source/jewellery-store
- Commit: `bdb37c5c5dc931ba3ff54a3cf634c52f546845fc`
- Render: pending (no RENDER_API_KEY)

