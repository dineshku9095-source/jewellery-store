# Dynamic header navigation

**Admin:** https://jewellery-web-3raw.onrender.com/admin/header-nav  
**Storefront:** https://jewellery-web-3raw.onrender.com

## What it does

Admins control the top storefront header (Jewellery, Blogs, Accessories, Collection, Category, Contact, …):

1. Toggle which top-level items are visible
2. Add dropdown children (label + URL — use `/category/<slug>` or `/collections/<slug>` for catalog refs)
3. Reorder items and children; remove unused links

## How to use

1. Sign in at `/admin/login`
2. Open **Header nav** in the admin sidebar
3. Edit labels/URLs, check **Visible**, use **Up/Down** to reorder
4. Under an item, **Add child link** for dropdown rows (each has Show + reorder)
5. **Save header navigation** — refresh the storefront to see changes
6. Optional: **Load defaults** restores the brand starter nav (unsaved until you Save)

## Storage (Neon-friendly)

- Column: `StoreSettings.headerNav` (JSONB) — no extra tables
- Schema/defaults: `@jewellery/shared` → `headerNavSchema`, `DEFAULT_HEADER_NAV`
- Admin API: `GET/PUT /api/admin/header-nav`
- Public: `GET /api/settings/public` → `settings.headerNav`
- Storefront: `SiteHeader` / footer Explore links read that payload (defaults until first save)
