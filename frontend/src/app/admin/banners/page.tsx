"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminCreate, adminDelete, adminList, adminMe, adminUpdate } from "@/lib/admin-api";
import {
  AdminEmpty,
  AdminField,
  AdminPageHeader,
  AdminPanel,
  AdminToast,
  confirmDelete,
  useToast,
} from "@/components/admin/AdminUi";

type Banner = {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
};

const emptyForm = {
  title: "",
  subtitle: "",
  imageUrl: "",
  linkUrl: "",
  sortOrder: "0",
  isActive: true,
};

export default function AdminBannersPage() {
  const router = useRouter();
  const { toast, showOk, showErr, clear } = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const data = await adminList<{ banners: Banner[] }>("/api/admin/banners");
    setBanners(data.banners);
  }, []);

  useEffect(() => {
    adminMe()
      .then(load)
      .catch(() => router.replace("/admin/login"));
  }, [load, router]);

  function startEdit(b: Banner) {
    setEditingId(b.id);
    setForm({
      title: b.title,
      subtitle: b.subtitle ?? "",
      imageUrl: b.imageUrl,
      linkUrl: b.linkUrl ?? "",
      sortOrder: String(b.sortOrder),
      isActive: b.isActive,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const body = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || undefined,
        imageUrl: form.imageUrl.trim(),
        linkUrl: form.linkUrl.trim(),
        sortOrder: Number(form.sortOrder) || 0,
        isActive: form.isActive,
      };
      if (editingId) {
        await adminUpdate(`/api/admin/banners/${editingId}`, body);
        showOk("Banner updated");
      } else {
        await adminCreate("/api/admin/banners", body);
        showOk("Banner created");
      }
      resetForm();
      await load();
    } catch (err) {
      showErr(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(b: Banner) {
    try {
      await adminUpdate(`/api/admin/banners/${b.id}`, { isActive: !b.isActive });
      showOk(b.isActive ? "Banner deactivated" : "Banner activated");
      await load();
    } catch (err) {
      showErr(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function onDelete(b: Banner) {
    if (!confirmDelete(`banner “${b.title}”`)) return;
    setBusy(true);
    try {
      await adminDelete(`/api/admin/banners/${b.id}`);
      showOk("Banner deleted");
      if (editingId === b.id) resetForm();
      await load();
    } catch (err) {
      showErr(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <AdminPageHeader title="Banners" subtitle="Homepage / promo banners with active toggle." />
      <AdminToast message={toast?.message ?? null} tone={toast?.tone} onClear={clear} />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-2">
          {banners.length === 0 ? (
            <AdminEmpty message="No banners yet." />
          ) : (
            banners.map((b) => (
              <AdminPanel key={b.id} className="flex flex-wrap items-center justify-between gap-3 !py-3">
                <div className="min-w-0">
                  <p className="font-medium text-forest">{b.title}</p>
                  <p className="truncate text-xs text-muted">
                    Order {b.sortOrder} · {b.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="btn-outline-dark !px-3 !py-1.5 text-[10px]" onClick={() => toggleActive(b)}>
                    {b.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button type="button" className="btn-outline-dark !px-3 !py-1.5 text-[10px]" onClick={() => startEdit(b)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="border border-sale/40 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-sale"
                    onClick={() => onDelete(b)}
                    disabled={busy}
                  >
                    Delete
                  </button>
                </div>
              </AdminPanel>
            ))
          )}
        </div>

        <AdminPanel>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-gold">
            {editingId ? "Edit banner" : "New banner"}
          </p>
          <form onSubmit={onSubmit} className="space-y-3">
            <AdminField label="Title">
              <input
                className="input-field"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </AdminField>
            <AdminField label="Subtitle">
              <input
                className="input-field"
                value={form.subtitle}
                onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
              />
            </AdminField>
            <AdminField label="Image URL">
              <input
                className="input-field"
                type="url"
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                required
                placeholder="https://…"
              />
            </AdminField>
            <AdminField label="Link URL">
              <input
                className="input-field"
                value={form.linkUrl}
                onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
                placeholder="/shop"
              />
            </AdminField>
            <AdminField label="Sort order">
              <input
                className="input-field"
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
              />
            </AdminField>
            <label className="flex items-center gap-2 text-sm text-forest">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              />
              Active
            </label>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary" disabled={busy}>
                {editingId ? "Update" : "Create"}
              </button>
              {editingId ? (
                <button type="button" className="btn-outline-dark" onClick={resetForm}>
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </AdminPanel>
      </div>
    </div>
  );
}
