# Neon free-tier database tips

This project targets **Neon free** (no paid DB upgrade). Storage and compute are limited — keep the schema small and never put media in Postgres.

## What we removed

| Removed | Why |
|---------|-----|
| `AdminAuditLog` | Unbounded append-only writes on every admin action |
| `OrderStatusHistory` | Extra row per status change; current status lives on `Order` |
| Admin **Audit** UI + `GET /api/admin/audit` | No table to back it |

## What stays (shop + admin)

- `Admin` / `AdminSession` — login
- `Category`, `Collection`, `Product`, `ProductVariant`, `ProductImage`, `ProductCollection`
- `Banner`, `StoreSettings`
- `Order`, `OrderItem` — WhatsApp checkout pipeline
- Prices as `DECIMAL(12,2)`; image **URLs + Cloudinary publicId** only

## Storage rules

1. **Do not store images in Neon.** Use Cloudinary (or HTTPS URLs). `ProductImage.url` / `Banner.imageUrl` are links.
2. **Cascade** product images/variants/collections on product delete; **restrict** delete when order items reference a product.
3. **Indexes kept lean:** uniques on slugs/SKUs/order numbers; `Product.isPublished`; `Order(status, createdAt)`; `Banner(isActive, sortOrder)`; session expiry. Avoid adding unused indexes.
4. Expire admin sessions (already purged when validated) so `AdminSession` does not grow forever.
5. Prefer unpublishing products over leaving orphaned drafts; hard-delete only when no order FKs.

## Estimated savings

- **Audit log:** typically the fastest-growing table (login, CRUD, upload sign). Dropping it stops unbounded row growth and JSON metadata writes — often tens–hundreds of KB → MB over months of admin use, plus fewer write units.
- **Status history:** ~1 row per status transition per order. Dropping it saves N×order lifecycle rows and one insert per status change.
- Together this is the main free-tier win for a small jewellery catalogue (dozens of products, hundreds of orders).

## Staying under Neon free limits

- Keep catalogue modest; archive old cancelled orders periodically if volume grows.
- Use Neon **pooled** `postgresql://…-pooler…` URL (already).
- Watch Neon dashboard storage; if approaching the cap, prune unused products/banners and confirm Cloudinary holds media.
- Do not enable heavy Prisma logging or store large `notes` blobs.
- One region / one branch for production is enough on free.

## Migrate

```bash
cd backend && npx prisma migrate deploy
```

Migration `20261031123000_drop_audit_and_status_history` drops the two tables only — **orders and catalogue data are preserved**.
