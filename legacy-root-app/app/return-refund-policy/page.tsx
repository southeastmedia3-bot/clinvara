import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Return and Refund Policy",
  description: "CLINVARA return and refund policy for damaged, incorrect, or eligible orders.",
};

export default function ReturnRefundPolicyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-text-muted)]">
        Orders
      </p>
      <h1 className="mt-3 font-display text-5xl font-semibold">Return and Refund Policy</h1>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-[var(--brand-text-muted)]">
        <p>For hygiene and product safety, opened or used skincare products may not be eligible for return unless they arrive damaged, defective, expired, or incorrect.</p>
        <p>To request help, contact us with your order number, product name, photos of the issue, and delivery details. Requests should be raised as soon as possible after delivery.</p>
        <p>Approved refunds are processed to the original payment method where possible. Refund timing depends on the payment provider and bank processing timelines.</p>
      </div>
    </main>
  );
}
