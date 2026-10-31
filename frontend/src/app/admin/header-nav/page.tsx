"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_HEADER_NAV,
  newHeaderNavChild,
  newHeaderNavItem,
  type HeaderNav,
  type HeaderNavItem,
} from "@jewellery/shared";
import { adminList, adminMe, adminPut } from "@/lib/admin-api";
import {
  AdminEmpty,
  AdminField,
  AdminPageHeader,
  AdminPanel,
  AdminToast,
  useToast,
} from "@/components/admin/AdminUi";

function cloneDefaults(): HeaderNav {
  return structuredClone(DEFAULT_HEADER_NAV);
}

function moveItem<T>(list: T[], index: number, dir: -1 | 1): T[] {
  const next = index + dir;
  if (next < 0 || next >= list.length) return list;
  const copy = [...list];
  const [row] = copy.splice(index, 1);
  copy.splice(next, 0, row);
  return copy;
}

export default function AdminHeaderNavPage() {
  const router = useRouter();
  const { toast, showOk, showErr, clear } = useToast();
  const [nav, setNav] = useState<HeaderNav | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    adminMe()
      .then(() => adminList<{ headerNav: HeaderNav }>("/api/admin/header-nav"))
      .then((data) => setNav(data.headerNav ?? cloneDefaults()))
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  function updateItems(items: HeaderNavItem[]) {
    setNav((n) => (n ? { ...n, items } : n));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!nav) return;
    setBusy(true);
    try {
      const saved = await adminPut<{ headerNav: HeaderNav }>("/api/admin/header-nav", nav);
      setNav(saved.headerNav);
      showOk("Header navigation saved — refresh the storefront");
    } catch (err) {
      showErr(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  if (!nav) return <p className="text-muted">Loading…</p>;

  return (
    <div>
      <AdminPageHeader
        title="Header navigation"
        subtitle="Choose which top-level links show, add dropdown children, reorder, and toggle visibility."
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-outline-dark !px-4 !py-2 text-[10px]"
              onClick={() => updateItems([...nav.items, newHeaderNavItem()])}
            >
              Add item
            </button>
            <button
              type="button"
              className="btn-outline-dark !px-4 !py-2 text-[10px]"
              onClick={() => {
                if (window.confirm("Reset header nav to brand defaults?")) setNav(cloneDefaults());
              }}
            >
              Load defaults
            </button>
          </div>
        }
      />
      <AdminToast message={toast?.message ?? null} tone={toast?.tone} onClear={clear} />

      <form onSubmit={onSubmit} className="space-y-4">
        {nav.items.length === 0 ? (
          <AdminEmpty message="No nav items. Add one or load defaults." />
        ) : (
          nav.items.map((item, i) => (
            <AdminPanel key={item.id} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">
                  Item {i + 1}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-outline-dark !px-2 !py-1 text-[10px]"
                    onClick={() => updateItems(moveItem(nav.items, i, -1))}
                    disabled={i === 0}
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    className="btn-outline-dark !px-2 !py-1 text-[10px]"
                    onClick={() => updateItems(moveItem(nav.items, i, 1))}
                    disabled={i === nav.items.length - 1}
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    className="border border-sale/40 px-2 py-1 text-[10px] uppercase tracking-widest text-sale"
                    onClick={() => updateItems(nav.items.filter((_, idx) => idx !== i))}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <AdminField label="Label">
                  <input
                    className="input-field"
                    value={item.label}
                    onChange={(e) => {
                      const items = [...nav.items];
                      items[i] = { ...item, label: e.target.value };
                      updateItems(items);
                    }}
                    required
                  />
                </AdminField>
                <AdminField label="URL">
                  <input
                    className="input-field font-mono text-xs"
                    value={item.href}
                    onChange={(e) => {
                      const items = [...nav.items];
                      items[i] = { ...item, href: e.target.value };
                      updateItems(items);
                    }}
                    required
                    placeholder="/shop or /category/rings"
                  />
                </AdminField>
                <label className="flex items-end gap-2 pb-3 text-sm text-forest">
                  <input
                    type="checkbox"
                    checked={item.visible}
                    onChange={(e) => {
                      const items = [...nav.items];
                      items[i] = { ...item, visible: e.target.checked };
                      updateItems(items);
                    }}
                  />
                  Visible in header
                </label>
              </div>

              <div className="border-t border-line pt-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">
                    Dropdown children
                  </p>
                  <button
                    type="button"
                    className="text-[10px] uppercase tracking-widest text-gold underline"
                    onClick={() => {
                      const items = [...nav.items];
                      items[i] = {
                        ...item,
                        children: [...item.children, newHeaderNavChild()],
                      };
                      updateItems(items);
                    }}
                  >
                    Add child link
                  </button>
                </div>
                {item.children.length === 0 ? (
                  <p className="text-xs text-muted">No dropdown — top-level link only.</p>
                ) : (
                  <div className="space-y-2">
                    {item.children.map((child, ci) => (
                      <div
                        key={child.id}
                        className="grid gap-2 rounded border border-line bg-cream/60 p-2 md:grid-cols-[1fr_1fr_auto_auto]"
                      >
                        <input
                          className="input-field"
                          value={child.label}
                          onChange={(e) => {
                            const items = [...nav.items];
                            const children = [...item.children];
                            children[ci] = { ...child, label: e.target.value };
                            items[i] = { ...item, children };
                            updateItems(items);
                          }}
                          placeholder="Child label"
                          required
                        />
                        <input
                          className="input-field font-mono text-xs"
                          value={child.href}
                          onChange={(e) => {
                            const items = [...nav.items];
                            const children = [...item.children];
                            children[ci] = { ...child, href: e.target.value };
                            items[i] = { ...item, children };
                            updateItems(items);
                          }}
                          placeholder="/collections/bridal-edit"
                          required
                        />
                        <label className="flex items-center gap-1 text-xs text-forest">
                          <input
                            type="checkbox"
                            checked={child.visible}
                            onChange={(e) => {
                              const items = [...nav.items];
                              const children = [...item.children];
                              children[ci] = { ...child, visible: e.target.checked };
                              items[i] = { ...item, children };
                              updateItems(items);
                            }}
                          />
                          Show
                        </label>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            className="btn-outline-dark !px-2 !py-1 text-[10px]"
                            onClick={() => {
                              const items = [...nav.items];
                              items[i] = {
                                ...item,
                                children: moveItem(item.children, ci, -1),
                              };
                              updateItems(items);
                            }}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            className="btn-outline-dark !px-2 !py-1 text-[10px]"
                            onClick={() => {
                              const items = [...nav.items];
                              items[i] = {
                                ...item,
                                children: moveItem(item.children, ci, 1),
                              };
                              updateItems(items);
                            }}
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            className="px-2 text-[10px] uppercase text-sale"
                            onClick={() => {
                              const items = [...nav.items];
                              items[i] = {
                                ...item,
                                children: item.children.filter((_, idx) => idx !== ci),
                              };
                              updateItems(items);
                            }}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </AdminPanel>
          ))
        )}

        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? "Saving…" : "Save header navigation"}
        </button>
      </form>
    </div>
  );
}
