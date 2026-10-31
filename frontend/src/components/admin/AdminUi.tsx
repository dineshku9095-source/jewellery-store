"use client";

import { ReactNode, useEffect, useState } from "react";

export function AdminPageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
      <div>
        <h1 className="font-display text-3xl text-forest">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function AdminEmpty({ message }: { message: string }) {
  return (
    <div className="rounded border border-dashed border-line bg-cream px-4 py-10 text-center text-sm text-muted">
      {message}
    </div>
  );
}

export function AdminToast({
  message,
  tone = "ok",
  onClear,
}: {
  message: string | null;
  tone?: "ok" | "err";
  onClear?: () => void;
}) {
  useEffect(() => {
    if (!message || !onClear) return;
    const t = setTimeout(onClear, 3500);
    return () => clearTimeout(t);
  }, [message, onClear]);

  if (!message) return null;
  return (
    <div
      className={`mb-4 rounded border px-3 py-2 text-sm ${
        tone === "err"
          ? "border-sale/40 bg-sale/10 text-sale"
          : "border-gold/40 bg-blush text-forest"
      }`}
      role="status"
    >
      {message}
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; tone: "ok" | "err" } | null>(null);
  return {
    toast,
    showOk: (message: string) => setToast({ message, tone: "ok" }),
    showErr: (message: string) => setToast({ message, tone: "err" }),
    clear: () => setToast(null),
  };
}

export function confirmDelete(label: string): boolean {
  return window.confirm(`Delete ${label}? This cannot be undone.`);
}

export function AdminField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

export function AdminPanel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded border border-line bg-white p-4 shadow-sm ${className}`}>{children}</div>
  );
}
