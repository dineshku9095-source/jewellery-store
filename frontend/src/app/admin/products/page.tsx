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

type Category = { id: string; name: string };
type ProductImage = { id: string; url: string; alt?: string | null; sortOrder: number };
type Variant = {
  id?: string;
  sku: string;
  label: string;
  price: string;
  stock: number;
  isActive?: boolean;
};
type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isPublished: boolean;
  categoryId?: string | null;
  category?: Category | null;
  variants: Variant[];
  images: ProductImage[];
};

type FormState = {
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  isPublished: boolean;
  sku: string;
  label: string;
  price: string;
  stock: string;
  imageUrls: string;
};

const emptyForm: FormState = {
  name: "",
  slug: "",
  description: "",
  categoryId: "",
  isPublished: false,
  sku: "",
  label: "Standard",
  price: "0.00",
  stock: "0",
  imageUrls: "",
};

export default function AdminProductsPage() {
  const router = useRouter();
  const { toast, showOk, showErr, clear } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingImages, setEditingImages] = useState<ProductImage[]>([]);
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    const [p, c] = await Promise.all([
      adminList<{ products: Product[] }>("/api/admin/products"),
      adminList<{ categories: Category[] }>("/api/admin/categories"),
    ]);
    setProducts(p.products);
    setCategories(c.categories);
  }, []);

  useEffect(() => {
    adminMe()
      .then(load)
      .catch(() => router.replace("/admin/login"));
  }, [load, router]);

  function resetForm() {
    setEditingId(null);
    setEditingImages([]);
    setForm(emptyForm);
    setShowForm(false);
  }

  async function startEdit(id: string) {
    setBusy(true);
    try {
      const { product } = await adminList<{ product: Product }>(`/api/admin/products/${id}`);
      const v = product.variants[0];
      setEditingId(product.id);
      setEditingImages(product.images ?? []);
      setForm({
        name: product.name,
        slug: product.slug,
        description: product.description ?? "",
        categoryId: product.categoryId ?? "",
        isPublished: product.isPublished,
        sku: v?.sku ?? "",
        label: v?.label ?? "Standard",
        price: v?.price ?? "0.00",
        stock: String(v?.stock ?? 0),
        imageUrls: "",
      });
      setShowForm(true);
    } catch (err) {
      showErr(err instanceof Error ? err.message : "Load failed");
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const urls = form.imageUrls
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const variant = {
        sku: form.sku.trim() || `${slugify(form.name) || "item"}-std`,
        label: form.label.trim() || "Standard",
        price: form.price.trim(),
        stock: Number(form.stock) || 0,
        isActive: true,
      };
      const body = {
        name: form.name.trim(),
        slug: form.slug.trim() || slugify(form.name),
        description: form.description.trim() || undefined,
        categoryId: form.categoryId || null,
        isPublished: form.isPublished,
        variants: [variant],
      };

      if (editingId) {
        await adminUpdate(`/api/admin/products/${editingId}`, body);
        for (const url of urls) {
          await adminCreate(`/api/admin/products/${editingId}/images`, { url, alt: form.name });
        }
        showOk("Product updated");
      } else {
        await adminCreate("/api/admin/products", { ...body, imageUrls: urls });
        showOk("Product created");
      }
      resetForm();
      await load();
    } catch (err) {
      showErr(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function togglePublish(p: Product) {
    try {
      await adminUpdate(`/api/admin/products/${p.id}`, { isPublished: !p.isPublished });
      showOk(p.isPublished ? "Unpublished" : "Published");
      await load();
    } catch (err) {
      showErr(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function onDelete(p: Product) {
    if (!confirmDelete(`product “${p.name}”`)) return;
    setBusy(true);
    try {
      await adminDelete(`/api/admin/products/${p.id}`);
      showOk("Product deleted");
      if (editingId === p.id) resetForm();
      await load();
    } catch (err) {
      showErr(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  async function removeImage(imageId: string) {
    if (!editingId || !confirmDelete("this image")) return;
    try {
      await adminDelete(`/api/admin/products/${editingId}/images/${imageId}`);
      setEditingImages((imgs) => imgs.filter((i) => i.id !== imageId));
      showOk("Image removed");
      await load();
    } catch (err) {
      showErr(err instanceof Error ? err.message : "Image delete failed");
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Products"
        subtitle="Create, edit, publish, and delete products with multiple images."
        actions={
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            Add product
          </button>
        }
      />
      <AdminToast message={toast?.message ?? null} tone={toast?.tone} onClear={clear} />

      {showForm ? (
        <AdminPanel className="mb-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-gold">
            {editingId ? "Edit product" : "New product"}
          </p>
          <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2">
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
            <AdminField label="Category">
              <select
                className="input-field"
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              >
                <option value="">— None —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </AdminField>
            <AdminField label="SKU">
              <input
                className="input-field"
                value={form.sku}
                onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                required={!editingId}
              />
            </AdminField>
            <AdminField label="Variant label">
              <input
                className="input-field"
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              />
            </AdminField>
            <AdminField label="Price (INR)">
              <input
                className="input-field"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                required
                pattern="^\d+(\.\d{1,2})?$"
              />
            </AdminField>
            <AdminField label="Stock">
              <input
                className="input-field"
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
              />
            </AdminField>
            <div className="md:col-span-2">
              <AdminField label="Description">
                <textarea
                  className="input-field"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </AdminField>
            </div>
            <div className="md:col-span-2">
              <AdminField label="Image URLs (one per line)">
                <textarea
                  className="input-field font-mono text-xs"
                  rows={3}
                  value={form.imageUrls}
                  onChange={(e) => setForm((f) => ({ ...f, imageUrls: e.target.value }))}
                  placeholder="https://images.unsplash.com/…"
                />
              </AdminField>
              {editingImages.length > 0 ? (
                <ul className="mt-2 space-y-1 text-xs text-muted">
                  {editingImages.map((img) => (
                    <li key={img.id} className="flex items-center justify-between gap-2">
                      <span className="truncate">{img.url}</span>
                      <button
                        type="button"
                        className="shrink-0 text-sale underline"
                        onClick={() => removeImage(img.id)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <label className="flex items-center gap-2 text-sm text-forest md:col-span-2">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
              />
              Published on storefront
            </label>
            <div className="flex gap-2 md:col-span-2">
              <button type="submit" className="btn-primary" disabled={busy}>
                {editingId ? "Update product" : "Create product"}
              </button>
              <button type="button" className="btn-outline-dark" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </AdminPanel>
      ) : null}

      <div className="space-y-2">
        {products.length === 0 ? (
          <AdminEmpty message="No products yet. Add your first piece." />
        ) : (
          products.map((p) => (
            <AdminPanel key={p.id} className="flex flex-wrap items-center justify-between gap-3 !py-3">
              <div className="min-w-0">
                <p className="font-medium text-forest">{p.name}</p>
                <p className="text-xs text-muted">
                  {p.slug} · {p.category?.name ?? "Uncategorised"} ·{" "}
                  {p.isPublished ? "Published" : "Draft"} · {p.images?.length ?? 0} images
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn-outline-dark !px-3 !py-1.5 text-[10px]" onClick={() => togglePublish(p)}>
                  {p.isPublished ? "Unpublish" : "Publish"}
                </button>
                <button type="button" className="btn-outline-dark !px-3 !py-1.5 text-[10px]" onClick={() => startEdit(p.id)}>
                  Edit
                </button>
                <button
                  type="button"
                  className="border border-sale/40 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-sale"
                  onClick={() => onDelete(p)}
                  disabled={busy}
                >
                  Delete
                </button>
              </div>
            </AdminPanel>
          ))
        )}
      </div>
    </div>
  );
}
