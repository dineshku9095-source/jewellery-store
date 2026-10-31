# Homepage copy CMS

**Admin:** https://jewellery-web-3raw.onrender.com/admin/homepage

## Before

Most landing strings were hardcoded in `frontend/src/app/page.tsx` and `SiteChrome.tsx`. Store Settings only had storeName/tagline/WhatsApp; Banners were a separate table (not driving the current home layout).

## Now

- `StoreSettings.homepageContent` (JSON) holds editable copy.
- Defaults live in `@jewellery/shared` (`DEFAULT_HOMEPAGE_CONTENT`).
- Admin **Homepage** page → `PUT /api/admin/homepage`.
- Storefront home + header/footer load via `GET /api/settings/public`.

Layout and green Queen's Jewels Aura theme are unchanged — only text/URLs.
