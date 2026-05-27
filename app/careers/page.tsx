import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Careers",
  description: "Explore future career opportunities at CLINVARA.",
  alternates: { canonical: "/careers" },
  openGraph: {
    title: "Careers | CLINVARA",
    description: "Explore future career opportunities at CLINVARA.",
    url: "/careers",
  },
};

export default function CareersPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-text-muted)]">
        Careers
      </p>

      <h1 className="mt-3 font-display text-5xl font-semibold leading-tight">
        Build the future of minimal clinical skincare.
      </h1>

      <p className="mt-5 max-w-3xl text-sm leading-relaxed text-[var(--brand-text-muted)]">
        We are building a thoughtful skincare brand across ecommerce, product
        education, customer experience, design, content, and operations.
        Current openings will be published here as roles become available.
      </p>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          [
            "Brand and Content",
            "Ingredient education, journal content, campaign copy, and skincare storytelling.",
          ],
          [
            "Customer Experience",
            "Order support, routine guidance, feedback loops, and service quality.",
          ],
          [
            "Growth and Operations",
            "Ecommerce operations, analytics, merchandising, and marketplace readiness.",
          ],
        ].map(([title, body]) => (
          <article
            key={title}
            className="rounded-2xl border border-[var(--brand-border)] p-6"
          >
            <h2 className="font-display text-xl font-semibold">
              {title}
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-[var(--brand-text-muted)]">
              {body}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-10 rounded-2xl bg-[var(--brand-off-white)] p-6">
        <h2 className="font-display text-2xl font-semibold">
          General applications
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-[var(--brand-text-muted)]">
          Interested in working with CLINVARA? Send your portfolio or resume to
          our support team with the subject line &quot;Careers - CLINVARA&quot;.
        </p>

        <Link
          href="/contact"
          className="mt-5 inline-flex rounded-full bg-black px-6 py-3 text-sm font-semibold text-white"
        >
          Contact Us
        </Link>
      </section>
    </main>
  );
}
