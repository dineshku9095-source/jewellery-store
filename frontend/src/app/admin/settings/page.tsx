"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminList, adminMe, adminPut } from "@/lib/admin-api";
import {
  AdminField,
  AdminPageHeader,
  AdminPanel,
  AdminToast,
  useToast,
} from "@/components/admin/AdminUi";

export default function AdminSettingsPage() {
  const router = useRouter();
  const { toast, showOk, showErr, clear } = useToast();
  const [settings, setSettings] = useState<Record<string, string> | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    adminMe()
      .then(() => adminList<{ settings: Record<string, string> }>("/api/admin/settings"))
      .then((data) => setSettings(data.settings ?? {}))
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!settings) return;
    setBusy(true);
    try {
      const form = new FormData(e.currentTarget);
      const updated = await adminPut<{ settings: Record<string, string> }>("/api/admin/settings", {
        storeName: form.get("storeName"),
        tagline: form.get("tagline"),
        contactEmail: form.get("contactEmail"),
        contactPhone: form.get("contactPhone"),
        whatsappNumber: form.get("whatsappNumber"),
        address: form.get("address"),
        currency: form.get("currency") || "INR",
      });
      setSettings(updated.settings);
      showOk("Settings saved");
    } catch (err) {
      showErr(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  if (!settings) return <p className="text-muted">Loading…</p>;

  return (
    <div>
      <AdminPageHeader title="Store settings" subtitle="Public store identity and WhatsApp number." />
      <AdminToast message={toast?.message ?? null} tone={toast?.tone} onClear={clear} />
      <AdminPanel className="max-w-lg">
        <form onSubmit={onSubmit} className="space-y-3">
          <AdminField label="Store name">
            <input name="storeName" defaultValue={settings.storeName ?? ""} className="input-field" required />
          </AdminField>
          <AdminField label="Tagline">
            <input name="tagline" defaultValue={settings.tagline ?? ""} className="input-field" />
          </AdminField>
          <AdminField label="WhatsApp number">
            <input
              name="whatsappNumber"
              defaultValue={settings.whatsappNumber ?? ""}
              required
              className="input-field"
            />
          </AdminField>
          <AdminField label="Contact email">
            <input name="contactEmail" defaultValue={settings.contactEmail ?? ""} className="input-field" />
          </AdminField>
          <AdminField label="Contact phone">
            <input name="contactPhone" defaultValue={settings.contactPhone ?? ""} className="input-field" />
          </AdminField>
          <AdminField label="Address">
            <textarea name="address" defaultValue={settings.address ?? ""} className="input-field" rows={3} />
          </AdminField>
          <AdminField label="Currency">
            <input name="currency" defaultValue={settings.currency ?? "INR"} className="input-field" />
          </AdminField>
          <button type="submit" className="btn-primary" disabled={busy}>
            Save settings
          </button>
        </form>
      </AdminPanel>
    </div>
  );
}
