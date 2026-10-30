"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminList, adminMe } from "@/lib/admin-api";

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<
    Array<{ id: string; name: string; slug: string; isPublished: boolean }>
  >([]);

  useEffect(() => {
    adminMe()
      .then(() => adminList<{ products: typeof products }>("/api/admin/products"))
      .then((data) => setProducts(data.products))
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  return (
    <div>
      <h1 className="font-display text-3xl">Products</h1>
      <ul className="mt-6 divide-y divide-charcoal/10">
        {products.map((p) => (
          <li key={p.id} className="flex justify-between py-3 text-sm">
            <span>
              {p.name}{" "}
              <span className="text-charcoal-muted">({p.slug})</span>
            </span>
            <span>{p.isPublished ? "Published" : "Draft"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
