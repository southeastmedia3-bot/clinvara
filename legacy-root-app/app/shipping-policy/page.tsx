import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: "CLINVARA shipping policy for order processing, delivery timelines, and tracking.",
};

export default function ShippingPolicyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-text-muted)]">
        Orders
      </p>
      <h1 className="mt-3 font-display text-5xl font-semibold">Shipping Policy</h1>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-[var(--brand-text-muted)]">
        <p>Orders are usually processed after payment confirmation and stock verification. Delivery timelines may vary by location, courier availability, holidays, and weather conditions.</p>
        <p>Once shipping is enabled, tracking details will be shared by email, SMS, or through the Track Order page. Please ensure your contact and address details are accurate before placing an order.</p>
        <p>If a shipment is delayed, damaged, or marked delivered but not received, contact support with your order details so we can help investigate.</p>
      </div>
    </main>
  );
}
