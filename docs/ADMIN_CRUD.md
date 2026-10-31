# Admin CRUD (Queen's Jewels Aura)

**Live admin:** https://jewellery-web-3raw.onrender.com/admin/login  
**API:** https://jewellery-api-l84i.onrender.com

## Capabilities

| Section | List | Create | Edit | Delete | Publish / visibility |
|---------|------|--------|------|--------|----------------------|
| Categories | ✓ | ✓ | ✓ | ✓ (nullifies product.categoryId) | — |
| Collections | ✓ | ✓ | ✓ | ✓ | isPublished toggle |
| Products | ✓ | ✓ (+ **file upload**) | ✓ | ✓ (blocked if order items) | isPublished toggle |
| Product images | ✓ | ✓ file picker → Cloudinary | — | ✓ DB + Cloudinary destroy | — |
| Banners | ✓ | ✓ | ✓ | ✓ | isActive toggle |
| Orders | ✓ | — | status | — | status pipeline |
| Settings | ✓ | — | ✓ | — | — |

## Product image uploads

Admin product create/edit uses a **multi-file picker**. Flow:

1. Browser requests `GET /api/admin/uploads/sign` (authenticated).
2. Files upload directly to Cloudinary with the signed params.
3. API stores `ProductImage.url` (secure URL) + `ProductImage.publicId`.
4. Delete image removes the DB row and calls Cloudinary destroy when keys exist.

Optional “paste an image URL” remains as a secondary fallback (e.g. Unsplash).

### Render env (API service)

Set these on **jewellery-api** (never commit secrets):

| Variable | Notes |
|----------|--------|
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | API Key |
| `CLOUDINARY_API_SECRET` | API Secret |
| `CLOUDINARY_FOLDER` | Optional, default `jewellery-store` |

Free Cloudinary account is enough. After saving env vars, **Manual Deploy** the API (and ensure web is on latest `main`).  
`GET /health` should show `"cloudinary":"ok"`. Without keys, the file picker shows a clear toast explaining which env vars to set; sign endpoint returns **503**.

## Delete semantics

- Prefer **hard delete** with confirm.
- Products referenced by `OrderItem` return **409** — unpublish instead.
- Category delete clears `product.categoryId` then deletes the row.
- Collection / banner / unused product: hard delete; images cascade on product.

## CSRF note

`GET /api/admin/csrf` clears the prior CSRF cookie before minting a token so post-login session identifier changes do not break mutations.
