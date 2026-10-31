"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { PublicProduct } from "@/lib/api";

const TABS = ["Featured", "Best Sellers", "New Arrivals"] as const;

export function TrendingTabs({ products }: { products: PublicProduct[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Featured");

  const list = useMemo(() => {
    if (!products.length) return [];
    if (tab === "New Arrivals") return [...products].reverse().slice(0, 8);
    if (tab === "Best Sellers") return products.slice(0, 8);
    return products.slice(0, 8);
  }, [products, tab]);

  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center justify-center gap-6 border-b border-line pb-3 text-[11px] font-semibold uppercase tracking-[0.2em]">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={
              tab === t ? "text-ink underline decoration-2 underline-offset-8" : "text-muted hover:text-ink"
            }
          >
            {t}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <p className="mt-12 text-center text-sm text-muted">Products will appear here once seeded.</p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
