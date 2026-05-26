import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Frequently asked questions about CLINVARA products, routines, accounts, shipping, returns, and support.",
};

const groups = [
  {
    title: "Products and Routines",
    items: [
      ["How do I choose a product?", "Start with your main concern, then keep the routine simple: cleanse, treat, moisturize, and use sunscreen during the day."],
      ["Can I use actives every day?", "Introduce active ingredients gradually. If irritation occurs, reduce frequency and focus on barrier-supporting products."],
      ["Is website guidance medical advice?", "No. Product pages, blog content, and AI assistant responses are general skincare information and do not replace a dermatologist."],
    ],
  },
  {
    title: "Accounts and Login",
    items: [
      ["How does mobile OTP login work?", "We use Firebase Authentication to send and verify OTPs to your mobile number."],
      ["Can I sign in with Google or Facebook?", "Yes, where social login is enabled and your provider account authorizes the sign-in."],
      ["Can I save products?", "Yes. Use the wishlist icon on product cards and view saved products from your account dashboard."],
    ],
  },
  {
    title: "Orders and Support",
    items: [
      ["How do I track my order?", "Use the Track Order page with your order ID and registered contact details once order tracking is connected."],
      ["Where can I read shipping details?", "See the Shipping Policy for processing, tracking, and delivery support details."],
      ["How do returns work?", "See the Return and Refund Policy for damaged, incorrect, defective, or eligible order requests."],
    ],
  },
];

export default function FaqsPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-text-muted)]">
        Help
      </p>
      <h1 className="mt-3 font-display text-5xl font-semibold">FAQs</h1>
      <p className="mt-5 max-w-3xl text-sm leading-relaxed text-[var(--brand-text-muted)]">
        Quick answers about products, routines, accounts, orders, and customer support.
      </p>
      <div className="mt-10 space-y-8">
        {groups.map((group) => (
          <section key={group.title}>
            <h2 className="font-display text-3xl font-semibold">{group.title}</h2>
            <div className="mt-4 divide-y divide-[var(--brand-border)] rounded-2xl border border-[var(--brand-border)]">
              {group.items.map(([question, answer]) => (
                <div key={question} className="p-5">
                  <h3 className="font-semibold">{question}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--brand-text-muted)]">{answer}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      <section className="mt-10 rounded-2xl bg-[var(--brand-off-white)] p-6">
        <p className="text-sm text-[var(--brand-text-muted)]">
          Still need help?{" "}
          <Link href="/contact" className="font-semibold text-black underline">Contact our support team</Link>.
        </p>
      </section>
    </main>
  );
}
