import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Values",
  description: "The principles behind CLINVARA formulas, service, and customer care.",
};

const values = [
  {
    title: "Clinical Simplicity",
    body: "We focus on purposeful formulas, clear routines, and ingredient transparency. Every product should be easy to understand and easy to place in a skincare ritual.",
  },
  {
    title: "Evidence-Led Care",
    body: "We prioritize tested ingredients, responsible claims, and skincare education that avoids exaggeration. Our role is to support informed decisions, not create confusion.",
  },
  {
    title: "Respect for Skin",
    body: "We design for consistency, barrier support, and long-term comfort. We encourage gradual use of actives and thoughtful routines.",
  },
  {
    title: "Responsible Commerce",
    body: "We aim for fair pricing, clear policies, responsive support, and packaging choices that improve over time.",
  },
];

export default function OurValuesPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-text-muted)]">
        Company
      </p>
      <h1 className="mt-3 font-display text-5xl font-semibold">Our Values</h1>
      <p className="mt-5 max-w-2xl text-sm leading-relaxed text-[var(--brand-text-muted)]">
        CLINVARA is built around minimal, science-backed skincare with a premium
        but practical customer experience.
      </p>
      <section className="mt-10 grid gap-4 md:grid-cols-2">
        {values.map((value) => (
          <article key={value.title} className="rounded-2xl border border-[var(--brand-border)] p-6">
            <h2 className="font-display text-2xl font-semibold">{value.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--brand-text-muted)]">
              {value.body}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
