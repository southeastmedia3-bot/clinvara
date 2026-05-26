import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sustainability",
  description: "CLINVARA sustainability approach for packaging, sourcing, and responsible skincare.",
};

export default function SustainabilityPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-text-muted)]">
        Responsibility
      </p>
      <h1 className="mt-3 font-display text-5xl font-semibold">Sustainability</h1>
      <p className="mt-6 text-sm leading-relaxed text-[var(--brand-text-muted)]">
        Our sustainability work is practical and ongoing. We focus on reducing
        unnecessary packaging, improving material choices, encouraging mindful
        routines, and avoiding exaggerated consumption.
      </p>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          ["Better Packaging", "We aim to move toward recyclable, reusable, and lower-impact packaging where possible."],
          ["Conscious Formulas", "We prioritize purposeful products that support clear routines instead of over-layering."],
          ["Continuous Improvement", "We review supplier practices, shipping materials, and customer feedback as we grow."],
        ].map(([title, body]) => (
          <section key={title} className="rounded-2xl border border-[var(--brand-border)] p-5">
            <h2 className="font-display text-xl font-semibold">{title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--brand-text-muted)]">{body}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
