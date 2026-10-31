"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Storefront error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">Temporary issue</p>
      <h1 className="mt-3 font-display text-3xl text-forest">Something went wrong</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        The shop API may be waking up (Render free tier). Wait a few seconds and try again.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <button type="button" className="btn-primary w-full sm:w-auto" onClick={() => reset()}>
          Try again
        </button>
        <Link href="/" className="btn-outline-dark w-full sm:w-auto">
          Home
        </Link>
      </div>
    </div>
  );
}
