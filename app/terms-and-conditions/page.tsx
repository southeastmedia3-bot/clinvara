import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "Terms and conditions for using CLINVARA website, account services, ecommerce features, AI assistant, orders, returns, and customer support.",
  alternates: { canonical: "/terms-and-conditions" },
  openGraph: {
    title: "Terms and Conditions | CLINVARA",
    description:
      "Terms and conditions for using CLINVARA website, account services, ecommerce features, AI assistant, orders, returns, and customer support.",
    url: "/terms-and-conditions",
  },
};

const sections = [
  ["Acceptance of Terms", "By accessing or using CLINVARA, you agree to these Terms and Conditions, the Privacy Policy, and applicable policies for shipping, returns, refunds, offers, and customer support. If you do not agree, please do not use the website."],
  ["Eligibility and Accounts", "You are responsible for maintaining accurate account information and protecting your email, password, social login, and mobile OTP access. You must not use another person's account or attempt unauthorized access."],
  ["Product Information and Claims", "We aim to display accurate product descriptions, pricing, MRP, ingredients, sizes, and availability. Product packaging, claims, prices, offers, and stock may change. Always read product labels, patch test where appropriate, and follow usage instructions."],
  ["Skincare Guidance", "Website content, routines, ingredient education, and AI assistant responses are general information only. They are not medical advice, diagnosis, or treatment. Consult a dermatologist or healthcare professional for medical concerns, persistent irritation, allergies, pregnancy-related skincare questions, or prescription treatments."],
  ["Orders, Pricing, and Acceptance", "Placing an order does not guarantee acceptance. Orders are subject to payment confirmation, stock availability, serviceability, fraud checks, and operational review. We may cancel or refund an order where required, including for pricing errors, suspected misuse, or unavailable inventory."],
  ["Payments", "Payments are processed through third-party payment providers. You agree to provide accurate payment and billing information and comply with the terms of the relevant payment provider, bank, wallet, card network, or UPI service."],
  ["Shipping, Delivery, and Risk", "Shipping timelines are estimates and may vary by location, courier availability, holidays, weather, force majeure events, or incorrect customer information. Review our Shipping Policy for details."],
  ["Returns, Refunds, and Cancellations", "Returns and refunds are handled according to our Return and Refund Policy. For hygiene and safety, opened or used skincare products may have limited return eligibility unless damaged, defective, expired, or incorrectly delivered."],
  ["Offers and Promotions", "Discounts, gifts, coupons, and promotional offers may be time-bound, stock-bound, account-specific, or subject to additional conditions. CLINVARA may modify or withdraw offers where legally permitted."],
  ["User Conduct", "You must not misuse the website, upload harmful content, attempt to disrupt services, scrape data, impersonate others, abuse promotions, or submit false support, order, or return claims."],
  ["Intellectual Property", "The CLINVARA name, logo, website design, product content, images, copy, and brand elements are owned by or licensed to CLINVARA. You may not copy, reproduce, or commercially exploit them without permission."],
  ["Limitation of Liability", "To the extent permitted by applicable law, CLINVARA is not liable for indirect, incidental, special, punitive, or consequential losses arising from website use, service interruptions, third-party services, or product misuse."],
  ["Grievance and Customer Support", "For complaints, order issues, privacy requests, or policy questions, contact us through the Contact Us page. We aim to acknowledge customer complaints within 48 hours and work toward resolution within one month, where feasible and applicable."],
  ["Governing Law", "These Terms are governed by the laws of India. Subject to applicable consumer rights and dispute mechanisms, disputes will be handled through appropriate courts or forums in India."],
  ["Changes to Terms", "We may update these Terms as business operations, website features, or laws change. The updated terms will be posted on this page with a revised effective date."],
];

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-text-muted)]">
        Legal
      </p>
      <h1 className="mt-3 font-display text-5xl font-semibold">Terms and Conditions</h1>
      <p className="mt-4 text-sm text-[var(--brand-text-muted)]">Effective date: May 25, 2026</p>
      <p className="mt-6 max-w-3xl text-sm leading-relaxed text-[var(--brand-text-muted)]">
        These terms govern your use of the CLINVARA website, accounts, digital
        features, customer support, and ecommerce services.
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
        <h2 className="font-display text-2xl font-semibold">Related Policies</h2>
        <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
          <Link href="/privacy-policy" className="rounded-full border border-black px-4 py-2">Privacy Policy</Link>
          <Link href="/shipping-policy" className="rounded-full border border-black px-4 py-2">Shipping Policy</Link>
          <Link href="/return-refund-policy" className="rounded-full border border-black px-4 py-2">Return and Refund Policy</Link>
        </div>
      </section>
    </main>
  );
}
