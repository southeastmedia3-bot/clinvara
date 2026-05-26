import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Frequently asked questions about CLINVARA products, routines, orders, and accounts.",
};

const faqs = [
  ["How do I choose a product?", "Start with your main concern, then keep the routine simple: cleanse, treat, moisturize, and use sunscreen during the day."],
  ["Can I use actives every day?", "Introduce active ingredients gradually. If irritation occurs, reduce frequency and focus on barrier-supporting products."],
  ["How do I track my order?", "Use the Track Order page with your order details once checkout and order tracking are connected."],
  ["How does mobile OTP login work?", "We use Firebase Authentication to send and verify OTPs to your mobile number."],
  ["Can I save products?", "Yes. Use the wishlist icon on product cards and view saved products from your account dashboard."],
];

export default function FaqsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-text-muted)]">
        Help
      </p>
      <h1 className="mt-3 font-display text-5xl font-semibold">FAQs</h1>
      <div className="mt-10 divide-y divide-[var(--brand-border)] rounded-2xl border border-[var(--brand-border)]">
        {faqs.map(([question, answer]) => (
          <section key={question} className="p-6">
            <h2 className="font-semibold">{question}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--brand-text-muted)]">{answer}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
