import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Values",
  description: "The principles behind CLINVARA formulas, service, and customer care.",
  alternates: { canonical: "/our-values" },
  openGraph: {
    title: "Our Values | CLINVARA",
    description: "The principles behind CLINVARA formulas, service, and customer care.",
    url: "/our-values",
  },
};

const values = [
  {
    title: "Clinical Simplicity",
    body: "We build purposeful formulas and clear routines so every product has a defined role. Ingredient information should be easy to understand, easy to compare, and easy to use consistently.",
  },
  {
    title: "Evidence-Led Care",
    body: "We prefer responsible claims, tested ingredients, and education that avoids exaggeration. Our role is to support informed skincare decisions, not create urgency or confusion.",
  },
  {
    title: "Respect for Skin",
    body: "We design for barrier support, long-term comfort, and gradual use of active ingredients. Skin should be treated with patience, not pressure.",
  },
  {
    title: "Responsible Commerce",
    body: "We aim for fair pricing, transparent policies, responsive support, and thoughtful packaging choices that keep improving as the brand grows.",
  },
  {
    title: "Customer Privacy",
    body: "We collect only the information needed to provide the shopping experience, support orders, and improve service with consent-led communication.",
  },
  {
    title: "Inclusive Service",
    body: "We keep the experience accessible, respectful, and useful for different routines, skin goals, and levels of skincare knowledge.",
  },
];

export default function OurValuesPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
      <section className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-text-muted)]">
          Company
        </p>
        <h1 className="mt-3 font-display text-5xl font-semibold">Our Values</h1>
        <p className="mt-5 text-sm leading-relaxed text-[var(--brand-text-muted)]">
          CLINVARA is built around minimal, science-backed skincare with a
          premium but practical customer experience. These principles guide how
          we formulate, communicate, sell, and support every order.
        </p>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {values.map((value) => (
          <article
            key={value.title}
            className="rounded-2xl border border-[var(--brand-border)] bg-white p-6"
          >
            <h2 className="font-display text-2xl font-semibold">{value.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--brand-text-muted)]">
              {value.body}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-12 border-t border-[var(--brand-border)] pt-8">
        <h2 className="font-display text-3xl font-semibold">How We Apply Them</h2>
        <div className="mt-5 grid gap-6 text-sm leading-relaxed text-[var(--brand-text-muted)] md:grid-cols-3">
          <p>
            Product pages should state key ingredients, intended use, and routine
            placement without inflated promises.
          </p>
          <p>
            Customer policies should be visible, readable, and consistent across
            the website, order updates, and support responses.
          </p>
          <p>
            Brand decisions should balance performance, comfort, privacy, and
            responsibility instead of chasing unnecessary complexity.
          </p>
        </div>
      </section>
    </main>
  );
}
