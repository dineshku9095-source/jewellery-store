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

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count?: { products: number };
};

const emptyForm = { name: "", slug: "", description: "" };

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { toast, showOk, showErr, clear } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const data = await adminList<{ categories: Category[] }>("/api/admin/categories");
    setCategories(data.categories);
  }, []);

  useEffect(() => {
    adminMe()
      .then(load)
      .catch(() => router.replace("/admin/login"));
  }, [load, router]);

  function startEdit(c: Category) {
    setEditingId(c.id);
    setForm({
      name: c.name,
      slug: c.slug,
      description: c.description ?? "",
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
      };
      if (editingId) {
        await adminUpdate(`/api/admin/categories/${editingId}`, body);
        showOk("Category updated");
      } else {
        await adminCreate("/api/admin/categories", body);
        showOk("Category created");
      }
      resetForm();
      await load();
    } catch (err) {
      showErr(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(c: Category) {
    if (!confirmDelete(`category “${c.name}”`)) return;
    setBusy(true);
    try {
      await adminDelete(`/api/admin/categories/${c.id}`);
      showOk("Category deleted");
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
      <AdminPageHeader
        title="Categories"
        subtitle="Add, edit, or remove catalogue categories."
      />
      <AdminToast message={toast?.message ?? null} tone={toast?.tone} onClear={clear} />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-2">
          {categories.length === 0 ? (
            <AdminEmpty message="No categories yet. Create one with the form." />
          ) : (
            categories.map((c) => (
              <AdminPanel key={c.id} className="flex flex-wrap items-center justify-between gap-3 !py-3">
                <div>
                  <p className="font-medium text-forest">{c.name}</p>
                  <p className="text-xs text-muted">
                    /category/{c.slug}
                    {c._count ? ` · ${c._count.products} products` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
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
            {editingId ? "Edit category" : "New category"}
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
