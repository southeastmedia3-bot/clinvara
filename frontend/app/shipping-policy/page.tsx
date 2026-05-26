import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: "CLINVARA shipping policy for processing, delivery, tracking, delays, failed delivery, and customer support.",
};

const sections = [
  ["Order Processing", "Orders are processed after payment confirmation, inventory verification, and basic fraud checks. Processing timelines may vary during launches, sales, holidays, or operational disruptions."],
  ["Delivery Timelines", "Delivery timelines depend on serviceability, courier capacity, destination pincode, weather, holidays, and force majeure events. Any timeline shown on the website or order page is an estimate unless explicitly stated otherwise."],
  ["Shipping Charges", "Shipping charges, free shipping thresholds, cash handling fees, or other delivery-related charges will be shown before checkout where applicable."],
  ["Tracking", "Once shipping is enabled for an order, tracking information may be shared through email, SMS, account dashboard, or the Track Order page. Tracking updates depend on courier scans and may take time to refresh."],
  ["Address Accuracy", "Customers are responsible for providing accurate name, mobile number, email, pincode, and delivery address. Incorrect or incomplete address details may lead to delays, failed delivery, or return to origin."],
  ["Failed Delivery", "If delivery fails due to customer unavailability, incorrect address, refused delivery, or courier restrictions, the order may be returned to origin. Refund or reshipment eligibility will depend on the order status and reason for failure."],
  ["Damaged Packages", "If a package appears damaged or tampered with, take clear photos and contact support as soon as possible. Do not discard packaging until the issue is reviewed."],
];

export default function ShippingPolicyPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-text-muted)]">
        Orders
      </p>
      <h1 className="mt-3 font-display text-5xl font-semibold">Shipping Policy</h1>
      <p className="mt-5 max-w-3xl text-sm leading-relaxed text-[var(--brand-text-muted)]">
        This policy explains how CLINVARA handles order processing, shipment,
        delivery tracking, and delivery-related support.
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
        <h2 className="font-display text-2xl font-semibold">Need help with delivery?</h2>
        <p className="mt-3 text-sm text-[var(--brand-text-muted)]">
          Use the <Link href="/track-order" className="font-semibold text-black underline">Track Order</Link> page or contact support with your order ID and registered email/mobile number.
        </p>
      </section>
    </main>
  );
}
