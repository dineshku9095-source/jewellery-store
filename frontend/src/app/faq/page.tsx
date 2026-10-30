import { StaticPage } from "@/components/StaticPage";

export default function FaqPage() {
  return (
    <StaticPage title="FAQ">
      <p>
        <strong>Do I need an account?</strong> No — guest checkout only.
      </p>
      <p>
        <strong>How do I pay?</strong> Payment is arranged directly with the shop after we confirm
        your order on WhatsApp. We do not auto-mark orders as paid.
      </p>
      <p>
        <strong>Do you send WhatsApp messages for me?</strong> No. We provide a prefilled link; you
        send the message when ready.
      </p>
    </StaticPage>
  );
}
