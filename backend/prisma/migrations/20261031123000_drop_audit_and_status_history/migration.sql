-- Neon free-tier trim: drop write-heavy audit/history tables.
-- Does NOT touch products, orders, customers, catalogue, or sessions.

-- DropOrderStatusHistory
DROP TABLE IF EXISTS "OrderStatusHistory";

-- DropAdminAuditLog
DROP TABLE IF EXISTS "AdminAuditLog";

-- Product.categoryId: SetNull on category delete (was Restrict)
ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_categoryId_fkey";
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Helpful selective indexes (small; avoid over-indexing)
CREATE INDEX IF NOT EXISTS "Product_isPublished_idx" ON "Product"("isPublished");
CREATE INDEX IF NOT EXISTS "Banner_isActive_sortOrder_idx" ON "Banner"("isActive", "sortOrder");
