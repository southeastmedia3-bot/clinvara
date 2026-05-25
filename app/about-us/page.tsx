import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about CLINVARA, a clinical skincare brand built around transparent formulas and simple routines.",
};

const pillars = [
  ["Ingredient clarity", "We make product choices easier by explaining key actives, routine placement, and skin concerns in plain language."],
  ["Routine-first thinking", "We design around consistent routines, not crowded shelves. Cleanse, treat, moisturize, protect."],
  ["Premium access", "We aim to deliver a refined ecommerce experience with fair pricing, helpful support, and clear policies."],
];

export default function AboutUsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
      <section className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-text-muted)]">
            About CLINVARA
          </p>
          <h1 className="mt-3 font-display text-5xl font-semibold leading-tight">
            Clinical skincare, edited for real routines.
          </h1>
        </div>
        <p className="text-sm leading-relaxed text-[var(--brand-text-muted)]">
          CLINVARA is inspired by clinical minimalism: formulas that are easy to
          understand, routines that are easy to repeat, and education that helps
          customers choose with confidence. We focus on transparent skincare for
          everyday concerns such as hydration, barrier support, uneven tone,
          oiliness, and visible pigmentation.
        </p>
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-3">
        {pillars.map(([title, body]) => (
          <article key={title} className="rounded-2xl border border-[var(--brand-border)] p-6">
            <h2 className="font-display text-2xl font-semibold">{title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--brand-text-muted)]">{body}</p>
          </article>
        ))}
      </section>

      <section className="mt-12 rounded-2xl bg-[var(--brand-off-white)] p-6 sm:p-8">
        <h2 className="font-display text-3xl font-semibold">Our promise</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--brand-text-muted)]">
          We will keep product information direct, customer policies easy to
          find, and support channels accessible. As the brand grows, CLINVARA
          will continue improving packaging, digital privacy, and post-purchase
          service.
        </p>
        <Link href="/shop" className="mt-6 inline-flex rounded-full bg-black px-6 py-3 text-sm font-semibold text-white">
          Explore Products
        </Link>
      </section>
    </main>
  );
}