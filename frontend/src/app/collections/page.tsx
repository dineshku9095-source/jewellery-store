import Link from "next/link";
import { apiGet } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function CollectionsIndexPage() {
  const { collections } = await apiGet<{
    collections: Array<{ slug: string; name: string; description?: string | null }>;
  }>("/api/collections");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl text-charcoal">Collections</h1>
      <ul className="mt-8 space-y-6">
        {collections.map((c) => (
          <li key={c.slug}>
            <Link href={`/collections/${c.slug}`} className="font-display text-2xl text-champagne-dark">
              {c.name}
            </Link>
            {c.description ? <p className="text-charcoal-muted">{c.description}</p> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
