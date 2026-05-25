import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sustainability",
  description: "CLINVARA sustainability approach for packaging, sourcing, and responsible skincare.",
};

export default function SustainabilityPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
      <section className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-text-muted)]">
          Responsibility
        </p>
        <h1 className="mt-3 font-display text-5xl font-semibold">
          Sustainability
        </h1>
        <p className="mt-6 text-sm leading-relaxed text-[var(--brand-text-muted)]">
          Our sustainability work is practical and ongoing. We focus on reducing
          unnecessary packaging, improving material choices, encouraging mindful
          routines, and avoiding exaggerated consumption.
        </p>
      </section>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          [
            "Better Packaging",
            "We aim to move toward recyclable, reusable, and lower-impact packaging wherever it is practical for product safety and delivery quality.",
          ],
          [
            "Conscious Formulas",
            "We prioritize purposeful products that support clear routines instead of encouraging over-layering or unnecessary replacement.",
          ],
          [
            "Responsible Fulfilment",
            "We review shipping materials, supplier practices, and customer feedback so operational choices improve as the business grows.",
          ],
        ].map(([title, body]) => (
          <section
            key={title}
            className="rounded-2xl border border-[var(--brand-border)] bg-white p-6"
          >
            <h2 className="font-display text-xl font-semibold">{title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--brand-text-muted)]">
              {body}
            </p>
          </section>
        ))}
      </div>

      <section className="mt-12 grid gap-8 border-t border-[var(--brand-border)] pt-8 md:grid-cols-[0.85fr_1.15fr]">
        <div>
          <h2 className="font-display text-3xl font-semibold">
            Our Current Focus
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--brand-text-muted)]">
            Sustainability is not a single claim. It is a set of choices that
            should become more measurable over time.
          </p>
        </div>
        <ul className="space-y-4 text-sm leading-relaxed text-[var(--brand-text-muted)]">
          <li className="border-b border-[var(--brand-border)] pb-4">
            Reduce avoidable outer packaging and keep product inserts concise.
          </li>
          <li className="border-b border-[var(--brand-border)] pb-4">
            Improve recyclability and material disclosure as supplier options
            become available.
          </li>
          <li className="border-b border-[var(--brand-border)] pb-4">
            Encourage routine education that helps customers buy what they will
            use consistently.
          </li>
          <li>
            Avoid vague environmental promises and communicate progress with
            clarity.
          </li>
        </ul>
      </section>
    </main>
  );
}
