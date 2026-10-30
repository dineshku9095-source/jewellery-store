import Link from "next/link";
import { ReactNode } from "react";

export function StaticPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-4xl text-charcoal">{title}</h1>
      <div className="prose-store mt-8 space-y-4">{children}</div>
      <p className="mt-10">
        <Link href="/" className="text-champagne-dark underline">
          Back to home
        </Link>
      </p>
    </article>
  );
}
