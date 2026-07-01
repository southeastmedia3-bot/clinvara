import Link from "next/link";
import { Check } from "lucide-react";

export function RoutineStrip() {
  const trustPoints = [
    "Personalized Routine",
    "Dermatologist-Inspired Recommendations",
    "Takes Less Than 2 Minutes",
  ];

  return (
    <section className="bg-[var(--brand-primary)] py-14 text-white">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 text-center md:grid-cols-[1fr_auto] md:items-center md:text-left lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">
            Routine intelligence
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-none md:text-5xl">
            Skin Analysis & Routine Builder
          </h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-7 text-white/75">
            Get a personalized skincare routine tailored to your skin type,
            concerns, and lifestyle in under 2 minutes.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
            {trustPoints.map((point) => (
              <span
                key={point}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/80"
              >
                <Check className="h-3.5 w-3.5" />
                {point}
              </span>
            ))}
          </div>
        </div>
        <Link
          href="/skin-analysis"
          className="inline-flex h-12 items-center justify-center rounded-full bg-white px-7 text-xs font-semibold uppercase tracking-[0.16em] text-black transition-colors hover:bg-[var(--brand-accent)]"
        >
          Start Free Skin Analysis
        </Link>
      </div>
    </section>
  );
}
