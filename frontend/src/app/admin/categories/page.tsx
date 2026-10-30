"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminList, adminMe } from "@/lib/admin-api";

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);

  useEffect(() => {
    adminMe()
      .then(() => adminList<{ categories: typeof categories }>("/api/admin/categories"))
      .then((data) => setCategories(data.categories))
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  return (
    <div>
      <h1 className="font-display text-3xl">Categories</h1>
      <ul className="mt-6 space-y-2">
        {categories.map((c) => (
          <li key={c.id} className="rounded-sm border border-charcoal/10 px-4 py-3">
            {c.name} — /category/{c.slug}
          </li>
        ))}
      </ul>
    </div>
  );
}
