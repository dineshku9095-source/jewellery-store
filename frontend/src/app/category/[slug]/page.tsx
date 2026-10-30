import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { apiGet, type PublicProduct } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const [{ category }, { products }] = await Promise.all([
    apiGet<{ category: { name: string; description?: string | null } }>(
      `/api/categories/${params.slug}`
    ),
    apiGet<{ products: PublicProduct[] }>(`/api/products?category=${params.slug}`),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="text-sm uppercase tracking-widest text-champagne-dark">Category</p>
      <h1 className="font-display text-4xl text-charcoal">{category.name}</h1>
      {category.description ? (
        <p className="mt-2 text-charcoal-muted">{category.description}</p>
      ) : null}
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      <p className="mt-10">
        <Link href="/shop" className="text-champagne-dark underline">
          All products
        </Link>
      </p>
    </div>
  );
}
