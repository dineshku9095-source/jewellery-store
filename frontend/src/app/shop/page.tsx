import { ProductCard } from "@/components/ProductCard";
import { apiGet, type PublicProduct } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const { products } = await apiGet<{ products: PublicProduct[] }>("/api/products");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl text-charcoal">Shop</h1>
      <p className="mt-2 text-charcoal-muted">All published pieces — guest browsing, no account required.</p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
