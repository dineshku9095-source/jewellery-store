# Entity relationship (logical)

```
Admin 1──* AdminSession
Admin 1──* AdminAuditLog

Category 1──* Product
Product 1──* ProductVariant
Product 1──* ProductImage
Product *──* Collection (ProductCollection)

Order 1──* OrderItem ── Product, ProductVariant (FK)
Order 1──* OrderStatusHistory

StoreSettings (singleton row id=1)
Banner (standalone)
```

See `backend/prisma/schema.prisma` for fields and indexes.
