"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminList, adminMe } from "@/lib/admin-api";

export default function AdminCollectionsPage() {
  const router = useRouter();
  const [collections, setCollections] = useState<
    Array<{ id: string; name: string; slug: string; isPublished: boolean }>
  >([]);

  useEffect(() => {
    adminMe()
      .then(() => adminList<{ collections: typeof collections }>("/api/admin/collections"))
      .then((data) => setCollections(data.collections))
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  return (
    <div>
      <h1 className="font-display text-3xl">Collections</h1>
      <ul className="mt-6 space-y-2">
        {collections.map((c) => (
          <li key={c.id} className="rounded-sm border border-charcoal/10 px-4 py-3">
            {c.name} — {c.isPublished ? "Published" : "Hidden"}
          </li>
        ))}
      </ul>
    </div>
  );
}
