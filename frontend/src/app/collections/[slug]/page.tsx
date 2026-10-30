import { ProductCard } from "@/components/ProductCard";
import { apiGet, type PublicProduct } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function CollectionDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const [{ collection }, { products }] = await Promise.all([
    apiGet<{ collection: { name: string; description?: string | null } }>(
      `/api/collections/${params.slug}`
    ),
    apiGet<{ products: PublicProduct[] }>(`/api/products?collection=${params.slug}`),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl text-charcoal">{collection.name}</h1>
      {collection.description ? (
        <p className="mt-2 text-charcoal-muted">{collection.description}</p>
      ) : null}
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
