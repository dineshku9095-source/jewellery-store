import Link from "next/link";

export const dynamic = "force-dynamic";

export default function OrderSuccessPage({
  searchParams,
}: {
  searchParams: { order?: string; wa?: string };
}) {
  const orderNumber = searchParams.order ?? "";
  const wa = searchParams.wa ?? "";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <p className="text-sm uppercase tracking-widest text-champagne-dark">WhatsApp Pending</p>
      <h1 className="mt-4 font-display text-4xl text-charcoal">Thank you</h1>
      {orderNumber ? (
        <p className="mt-4 text-charcoal-muted">
          Order <strong>{orderNumber}</strong> was created. Status: WhatsApp Pending.
        </p>
      ) : null}
      <p className="mt-4 text-sm text-charcoal-muted">
        Tap below to open WhatsApp with a prefilled message for the shop. Sending the message is up
        to you — we never claim automatic delivery.
      </p>
      {wa ? (
        <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-primary mt-8 inline-flex">
          Open WhatsApp
        </a>
      ) : null}
      <p className="mt-6">
        <Link href="/shop" className="text-champagne-dark underline">
          Continue shopping
        </Link>
      </p>
    </div>
  );
}
