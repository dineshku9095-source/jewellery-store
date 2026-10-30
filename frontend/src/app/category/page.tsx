import Link from "next/link";
import { apiGet } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function CategoriesIndexPage() {
  const { categories } = await apiGet<{
    categories: Array<{ slug: string; name: string; description?: string | null }>;
  }>("/api/categories");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl text-charcoal">Categories</h1>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {categories.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/category/${c.slug}`}
              className="block rounded-sm border border-charcoal/10 bg-cream/40 p-6 hover:border-champagne/50"
            >
              <h2 className="font-display text-2xl">{c.name}</h2>
              {c.description ? <p className="mt-2 text-sm text-charcoal-muted">{c.description}</p> : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
