"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminList, adminMe, adminPut } from "@/lib/admin-api";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Record<string, string> | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    adminMe()
      .then(() => adminList<{ settings: Record<string, string> }>("/api/admin/settings"))
      .then((data) => setSettings(data.settings ?? {}))
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!settings) return;
    const form = new FormData(e.currentTarget);
    await adminPut("/api/admin/settings", {
      storeName: form.get("storeName"),
      tagline: form.get("tagline"),
      contactEmail: form.get("contactEmail"),
      contactPhone: form.get("contactPhone"),
      whatsappNumber: form.get("whatsappNumber"),
      address: form.get("address"),
      currency: form.get("currency") || "INR",
    });
    setSaved(true);
  }

  if (!settings) return <p>Loading…</p>;

  return (
    <div>
      <h1 className="font-display text-3xl">Store settings</h1>
      <form onSubmit={onSubmit} className="mt-6 max-w-lg space-y-3">
        <input name="storeName" defaultValue={settings.storeName ?? ""} className="input-field" placeholder="Store name" />
        <input name="tagline" defaultValue={settings.tagline ?? ""} className="input-field" placeholder="Tagline" />
        <input name="whatsappNumber" defaultValue={settings.whatsappNumber ?? ""} required className="input-field" placeholder="WhatsApp number" />
        <input name="contactEmail" defaultValue={settings.contactEmail ?? ""} className="input-field" placeholder="Contact email" />
        <input name="contactPhone" defaultValue={settings.contactPhone ?? ""} className="input-field" placeholder="Contact phone" />
        <textarea name="address" defaultValue={settings.address ?? ""} className="input-field" placeholder="Address" />
        <input name="currency" defaultValue={settings.currency ?? "INR"} className="input-field" placeholder="Currency" />
        <button type="submit" className="btn-primary">
          Save
        </button>
        {saved ? <p className="text-sm text-champagne-dark">Saved.</p> : null}
      </form>
    </div>
  );
}
