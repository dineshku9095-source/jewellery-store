"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminCreate,
  adminDelete,
  adminList,
  adminMe,
  adminUpdate,
  slugify,
} from "@/lib/admin-api";
import {
  AdminEmpty,
  AdminField,
  AdminPageHeader,
  AdminPanel,
  AdminToast,
  confirmDelete,
  useToast,
} from "@/components/admin/AdminUi";

type Collection = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isPublished: boolean;
  _count?: { products: number };
};

const emptyForm = { name: "", slug: "", description: "", isPublished: true };

export default function AdminCollectionsPage() {
  const router = useRouter();
  const { toast, showOk, showErr, clear } = useToast();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const data = await adminList<{ collections: Collection[] }>("/api/admin/collections");
    setCollections(data.collections);
  }, []);

  useEffect(() => {
    adminMe()
      .then(load)
      .catch(() => router.replace("/admin/login"));
  }, [load, router]);

  function startEdit(c: Collection) {
    setEditingId(c.id);
    setForm({
      name: c.name,
      slug: c.slug,
      description: c.description ?? "",
      isPublished: c.isPublished,
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
        name: form.name.trim(),
        slug: form.slug.trim() || slugify(form.name),
        description: form.description.trim() || undefined,
        isPublished: form.isPublished,
      };
      if (editingId) {
        await adminUpdate(`/api/admin/collections/${editingId}`, body);
        showOk("Collection updated");
      } else {
        await adminCreate("/api/admin/collections", body);
        showOk("Collection created");
      }
      resetForm();
      await load();
    } catch (err) {
      showErr(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function togglePublish(c: Collection) {
    try {
      await adminUpdate(`/api/admin/collections/${c.id}`, { isPublished: !c.isPublished });
      showOk(c.isPublished ? "Hidden from storefront" : "Published");
      await load();
    } catch (err) {
      showErr(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function onDelete(c: Collection) {
    if (!confirmDelete(`collection “${c.name}”`)) return;
    setBusy(true);
    try {
      await adminDelete(`/api/admin/collections/${c.id}`);
      showOk("Collection deleted");
      if (editingId === c.id) resetForm();
      await load();
    } catch (err) {
      showErr(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <AdminPageHeader title="Collections" subtitle="Curated groups with publish visibility." />
      <AdminToast message={toast?.message ?? null} tone={toast?.tone} onClear={clear} />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-2">
          {collections.length === 0 ? (
            <AdminEmpty message="No collections yet." />
          ) : (
            collections.map((c) => (
              <AdminPanel key={c.id} className="flex flex-wrap items-center justify-between gap-3 !py-3">
                <div>
                  <p className="font-medium text-forest">{c.name}</p>
                  <p className="text-xs text-muted">
                    /collections/{c.slug}
                    {c._count ? ` · ${c._count.products} products` : ""} ·{" "}
                    {c.isPublished ? "Published" : "Hidden"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="btn-outline-dark !px-3 !py-1.5 text-[10px]" onClick={() => togglePublish(c)}>
                    {c.isPublished ? "Unpublish" : "Publish"}
                  </button>
                  <button type="button" className="btn-outline-dark !px-3 !py-1.5 text-[10px]" onClick={() => startEdit(c)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="border border-sale/40 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-sale"
                    onClick={() => onDelete(c)}
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
            {editingId ? "Edit collection" : "New collection"}
          </p>
          <form onSubmit={onSubmit} className="space-y-3">
            <AdminField label="Name">
              <input
                className="input-field"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    name: e.target.value,
                    slug: editingId ? f.slug : slugify(e.target.value),
                  }))
                }
                required
              />
            </AdminField>
            <AdminField label="Slug">
              <input
                className="input-field"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                required
              />
            </AdminField>
            <AdminField label="Description">
              <textarea
                className="input-field"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </AdminField>
            <label className="flex items-center gap-2 text-sm text-forest">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
              />
              Published
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
