import { ProductCard } from "@/components/ProductCard";
import { apiGet, type PublicProduct } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  let products: PublicProduct[] = [];
  try {
    const res = await apiGet<{ products: PublicProduct[] }>("/api/products");
    products = res.products;
  } catch {
    products = [];
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="text-center">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Catalogue</p>
        <h1 className="mt-2 font-script text-5xl text-ink">Shop Jewellery</h1>
        <p className="mt-3 text-sm text-muted">All published pieces — guest browsing, no account required.</p>
      </div>
      <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 md:gap-8">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {products.length === 0 ? (
        <p className="mt-12 text-center text-sm text-muted">No products yet.</p>
      ) : null}
    </div>
  );
}
