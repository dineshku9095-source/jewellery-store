# Neon free-tier database tips

See also repo `docs/NEON_FREE_TIER.md`.

## Removed

- `AdminAuditLog` + admin Audit page/API
- `OrderStatusHistory` (status stays on `Order`; optional notes appended to `Order.notes`)

## Kept

Admin sessions, catalogue (products/images/variants/categories/collections), banners, settings, WhatsApp orders + items. Images = Cloudinary/URL only.

## Stay under free limits

No media in Postgres; lean indexes; pooled Neon URL; prune unused catalogue; watch Neon storage dashboard.
