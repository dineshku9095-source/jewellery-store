# Admin CRUD (Queen's Jewels Aura)

**Live admin:** https://jewellery-web-3raw.onrender.com/admin/login  
**API:** https://jewellery-api-l84i.onrender.com

## Capabilities

| Section | List | Create | Edit | Delete | Publish / visibility |
|---------|------|--------|------|--------|----------------------|
| Categories | ✓ | ✓ | ✓ | ✓ (nullifies product.categoryId) | — |
| Collections | ✓ | ✓ | ✓ | ✓ | isPublished toggle |
| Products | ✓ | ✓ (+ image URLs) | ✓ | ✓ (blocked if order items) | isPublished toggle |
| Product images | ✓ | ✓ | — | ✓ (+ Cloudinary destroy when configured) | — |
| Banners | ✓ | ✓ | ✓ | ✓ | isActive toggle |
| Orders | ✓ | — | status | — | status pipeline |
| Settings | ✓ | — | ✓ | — | — |

## Delete semantics

- Prefer **hard delete** with confirm.
- Products referenced by `OrderItem` return **409** — unpublish instead.
- Category delete clears `product.categoryId` then deletes the row.
- Collection / banner / unused product: hard delete; images cascade on product.

## CSRF note

`GET /api/admin/csrf` clears the prior CSRF cookie before minting a token so post-login session identifier changes do not break mutations.
