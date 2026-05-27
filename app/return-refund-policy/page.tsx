import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Return and Refund Policy",
  description: "CLINVARA return and refund policy for damaged, defective, incorrect, delayed, or eligible orders.",
  alternates: { canonical: "/return-refund-policy" },
  openGraph: {
    title: "Return and Refund Policy | CLINVARA",
    description: "CLINVARA return and refund policy for damaged, defective, incorrect, delayed, or eligible orders.",
    url: "/return-refund-policy",
  },
};

const sections = [
  ["Eligibility", "For hygiene and product safety, opened or used skincare products may not be eligible for return unless the product is damaged, defective, expired, incorrect, or otherwise eligible under applicable law and this policy."],
  ["Non-returnable Conditions", "Products may be rejected for return if they are used, altered, missing original packaging, missing batch/label details, damaged after delivery, or submitted without required order information."],
  ["Damaged, Defective, or Incorrect Products", "If you receive a damaged, defective, expired, missing, or incorrect product, contact us as soon as possible with order ID, photos/videos, package images, product label, and delivery details."],
  ["Late Delivery", "If goods are delivered materially later than the stated delivery schedule for reasons not caused by force majeure or customer-side issues, contact support so we can review the order and available remedy."],
  ["Return Review", "All return requests are reviewed before approval. We may request additional information, images, pickup inspection, or product verification."],
  ["Refund Method", "Approved refunds are usually processed to the original payment method where possible. Refund timelines depend on the payment provider, bank, wallet, UPI, or card network."],
  ["Cancellations", "Cancellation eligibility depends on order status. Orders already packed, dispatched, or delivered may not be cancellable and may need to follow the return process where eligible."],
  ["Misuse", "CLINVARA may refuse requests involving repeated policy abuse, false claims, missing evidence, tampered products, or suspicious order activity."],
];

export default function ReturnRefundPolicyPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-text-muted)]">
        Orders
      </p>
      <h1 className="mt-3 font-display text-5xl font-semibold">Return and Refund Policy</h1>
      <p className="mt-5 max-w-3xl text-sm leading-relaxed text-[var(--brand-text-muted)]">
        This policy explains how return, replacement, cancellation, and refund
        requests are reviewed for CLINVARA orders.
      </p>
      <div className="mt-10 space-y-6">
        {sections.map(([title, body]) => (
          <section key={title} className="border-t border-[var(--brand-border)] pt-6">
            <h2 className="font-display text-2xl font-semibold">{title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--brand-text-muted)]">{body}</p>
          </section>
        ))}
      </div>
      <section className="mt-10 rounded-2xl bg-[var(--brand-off-white)] p-6">
        <h2 className="font-display text-2xl font-semibold">How to raise a request</h2>
        <p className="mt-3 text-sm text-[var(--brand-text-muted)]">
          Contact us with your order ID, registered email/mobile number, issue
          description, and supporting photos through the{" "}
          <Link href="/contact" className="font-semibold text-black underline">Contact Us</Link>{" "}
          page.
        </p>
      </section>
    </main>
  );
}
