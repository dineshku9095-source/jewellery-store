"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_HOMEPAGE_CONTENT, type HomepageContent } from "@jewellery/shared";
import { adminList, adminMe, adminPut } from "@/lib/admin-api";
import {
  AdminField,
  AdminPageHeader,
  AdminPanel,
  AdminToast,
  useToast,
} from "@/components/admin/AdminUi";

function cloneDefaults(): HomepageContent {
  return structuredClone(DEFAULT_HOMEPAGE_CONTENT);
}

export default function AdminHomepagePage() {
  const router = useRouter();
  const { toast, showOk, showErr, clear } = useToast();
  const [form, setForm] = useState<HomepageContent | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    adminMe()
      .then(() => adminList<{ homepage: HomepageContent }>("/api/admin/homepage"))
      .then((data) => setForm(data.homepage ?? cloneDefaults()))
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  function update<K extends keyof HomepageContent>(key: K, value: HomepageContent[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    setBusy(true);
    try {
      const saved = await adminPut<{ homepage: HomepageContent }>("/api/admin/homepage", form);
      setForm(saved.homepage);
      showOk("Homepage copy saved — refresh the storefront to see it");
    } catch (err) {
      showErr(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  function resetDefaults() {
    if (!window.confirm("Reset all homepage fields to brand defaults?")) return;
    setForm(cloneDefaults());
  }

  if (!form) return <p className="text-muted">Loading…</p>;

  return (
    <div>
      <AdminPageHeader
        title="Homepage"
        subtitle="Edit landing-page headlines, trust strip, promos, trending title, offer banner, and footer blurb."
        actions={
          <button type="button" className="btn-outline-dark !px-4 !py-2 text-[10px]" onClick={resetDefaults}>
            Load defaults
          </button>
        }
      />
      <AdminToast message={toast?.message ?? null} tone={toast?.tone} onClear={clear} />

      <form onSubmit={onSubmit} className="space-y-6">
        <AdminPanel className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Top bar</p>
          <AdminField label="Promo text">
            <input
              className="input-field"
              value={form.topBarPromo}
              onChange={(e) => update("topBarPromo", e.target.value)}
              required
            />
          </AdminField>
          <AdminField label="Email shown in top bar">
            <input
              className="input-field"
              value={form.topBarEmail ?? ""}
              onChange={(e) => update("topBarEmail", e.target.value)}
            />
          </AdminField>
        </AdminPanel>

        <AdminPanel className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Hero</p>
          <AdminField label="Eyebrow">
            <input
              className="input-field"
              value={form.heroEyebrow}
              onChange={(e) => update("heroEyebrow", e.target.value)}
              required
            />
          </AdminField>
          <AdminField label="Headline">
            <input
              className="input-field"
              value={form.heroHeadline}
              onChange={(e) => update("heroHeadline", e.target.value)}
              required
            />
          </AdminField>
          <AdminField label="Body">
            <textarea
              className="input-field"
              rows={3}
              value={form.heroBody}
              onChange={(e) => update("heroBody", e.target.value)}
              required
            />
          </AdminField>
          <div className="grid gap-3 md:grid-cols-2">
            <AdminField label="CTA label">
              <input
                className="input-field"
                value={form.heroCtaLabel}
                onChange={(e) => update("heroCtaLabel", e.target.value)}
                required
              />
            </AdminField>
            <AdminField label="CTA link">
              <input
                className="input-field"
                value={form.heroCtaHref}
                onChange={(e) => update("heroCtaHref", e.target.value)}
                required
              />
            </AdminField>
          </div>
        </AdminPanel>

        <AdminPanel className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Trust strip</p>
          {form.trust.map((item, i) => (
            <div key={i} className="grid gap-3 md:grid-cols-2">
              <AdminField label={`Title ${i + 1}`}>
                <input
                  className="input-field"
                  value={item.title}
                  onChange={(e) => {
                    const trust = [...form.trust];
                    trust[i] = { ...trust[i], title: e.target.value };
                    update("trust", trust);
                  }}
                  required
                />
              </AdminField>
              <AdminField label={`Detail ${i + 1}`}>
                <input
                  className="input-field"
                  value={item.detail}
                  onChange={(e) => {
                    const trust = [...form.trust];
                    trust[i] = { ...trust[i], detail: e.target.value };
                    update("trust", trust);
                  }}
                  required
                />
              </AdminField>
            </div>
          ))}
        </AdminPanel>

        <AdminPanel className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Promo cards</p>
          {form.promos.map((item, i) => (
            <div key={i} className="space-y-2 rounded border border-line p-3">
              <p className="text-[11px] uppercase tracking-widest text-muted">Card {i + 1}</p>
              <AdminField label="Title">
                <input
                  className="input-field"
                  value={item.title}
                  onChange={(e) => {
                    const promos = [...form.promos];
                    promos[i] = { ...promos[i], title: e.target.value };
                    update("promos", promos);
                  }}
                  required
                />
              </AdminField>
              <AdminField label="Subtitle">
                <input
                  className="input-field"
                  value={item.subtitle ?? ""}
                  onChange={(e) => {
                    const promos = [...form.promos];
                    promos[i] = { ...promos[i], subtitle: e.target.value };
                    update("promos", promos);
                  }}
                />
              </AdminField>
              <div className="grid gap-3 md:grid-cols-2">
                <AdminField label="Link">
                  <input
                    className="input-field"
                    value={item.href}
                    onChange={(e) => {
                      const promos = [...form.promos];
                      promos[i] = { ...promos[i], href: e.target.value };
                      update("promos", promos);
                    }}
                    required
                  />
                </AdminField>
                <AdminField label="Image URL">
                  <input
                    className="input-field font-mono text-xs"
                    value={item.image}
                    onChange={(e) => {
                      const promos = [...form.promos];
                      promos[i] = { ...promos[i], image: e.target.value };
                      update("promos", promos);
                    }}
                    required
                  />
                </AdminField>
              </div>
            </div>
          ))}
          <AdminField label="Promo strip footer line">
            <input
              className="input-field"
              value={form.promoFooter}
              onChange={(e) => update("promoFooter", e.target.value)}
              required
            />
          </AdminField>
        </AdminPanel>

        <AdminPanel className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Trending section</p>
          <AdminField label="Title">
            <input
              className="input-field"
              value={form.trendingTitle}
              onChange={(e) => update("trendingTitle", e.target.value)}
              required
            />
          </AdminField>
          <AdminField label="Subtitle">
            <input
              className="input-field"
              value={form.trendingSubtitle}
              onChange={(e) => update("trendingSubtitle", e.target.value)}
              required
            />
          </AdminField>
        </AdminPanel>

        <AdminPanel className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Offer banner</p>
          <AdminField label="Eyebrow">
            <input
              className="input-field"
              value={form.offerEyebrow}
              onChange={(e) => update("offerEyebrow", e.target.value)}
              required
            />
          </AdminField>
          <AdminField label="Headline">
            <input
              className="input-field"
              value={form.offerHeadline}
              onChange={(e) => update("offerHeadline", e.target.value)}
              required
            />
          </AdminField>
          <AdminField label="Body">
            <textarea
              className="input-field"
              rows={2}
              value={form.offerBody}
              onChange={(e) => update("offerBody", e.target.value)}
              required
            />
          </AdminField>
          <div className="grid gap-3 md:grid-cols-2">
            <AdminField label="CTA label">
              <input
                className="input-field"
                value={form.offerCtaLabel}
                onChange={(e) => update("offerCtaLabel", e.target.value)}
                required
              />
            </AdminField>
            <AdminField label="CTA link">
              <input
                className="input-field"
                value={form.offerCtaHref}
                onChange={(e) => update("offerCtaHref", e.target.value)}
                required
              />
            </AdminField>
          </div>
          <AdminField label="Image URL">
            <input
              className="input-field font-mono text-xs"
              value={form.offerImageUrl}
              onChange={(e) => update("offerImageUrl", e.target.value)}
              required
            />
          </AdminField>
        </AdminPanel>

        <AdminPanel className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Footer</p>
          <AdminField label="Footer blurb">
            <textarea
              className="input-field"
              rows={3}
              value={form.footerBlurb}
              onChange={(e) => update("footerBlurb", e.target.value)}
              required
            />
          </AdminField>
        </AdminPanel>

        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? "Saving…" : "Save homepage copy"}
        </button>
      </form>
    </div>
  );
}
