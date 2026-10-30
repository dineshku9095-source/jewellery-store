# Admin usage

1. Sign in at `/admin/login` with bootstrap credentials (from `ADMIN_BOOTSTRAP_*` at seed time).
2. Change password under **Profile**.
3. Set **WhatsApp number** and store details under **Settings** (required for checkout).
4. Manage catalog: products, categories, collections, banners.
5. **Orders**: open an order, transition status manually (`WHATSAPP_PENDING` → … → `DELIVERED` or `CANCELLED`). Never auto-mark paid.
6. **Audit** lists admin actions.
7. Product images: use Cloudinary signed upload (`/api/admin/uploads/sign`) when keys are configured.
