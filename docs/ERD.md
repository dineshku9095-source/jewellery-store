# Entity relationship (logical)

Neon free-tier core schema (audit / status-history tables removed):

```
Admin 1──* AdminSession

Category 1──* Product          (Product.categoryId ON DELETE SET NULL)
Product 1──* ProductVariant    (CASCADE)
Product 1──* ProductImage      (CASCADE; url/publicId only — no blobs in Neon)
Product *──* Collection        (ProductCollection CASCADE)

Order 1──* OrderItem ── Product, ProductVariant (RESTRICT while order exists)
StoreSettings (singleton row id=1)
Banner (standalone)
```

Prices use `DECIMAL(12,2)`. Images are Cloudinary/HTTPS URLs only — never store binary media in Neon.

See `backend/prisma/schema.prisma` for fields and indexes.
