import type { Metadata } from "next";

import { HeroCarousel } from "@/components/home/HeroCarousel";
import { BestSellers } from "@/components/home/BestSellers";
import { CategoryFilter } from "@/components/home/CategoryFilter";
import { ConcernFilter } from "@/components/home/ConcernFilter";
import { RoutineStrip } from "@/components/home/RoutineStrip";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { SocialFeedStrip } from "@/components/home/SocialFeedStrip";
import { BlogPreview } from "@/components/home/BlogPreview";

export const metadata: Metadata = {
  title: "Clinical Skincare Products | Dermatologist-Tested Skin Care",
  description:
    "Shop dermatologist-tested clinical skincare powered by active ingredients for pigmentation, hydration, oil control, sensitive skin and skin barrier repair.",
  alternates: {
    canonical: "/",
  },
};

const homepageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Clinical Skincare Products | CLINVARA",
  url: "https://clinvara.global",
  description:
    "Shop dermatologist-tested clinical skincare powered by active ingredients for pigmentation, hydration, oil control and skin barrier repair.",
  isPartOf: {
    "@type": "WebSite",
    name: "CLINVARA",
    url: "https://clinvara.global",
  },
  about: [
    "clinical skincare",
    "dermatologist tested skincare",
    "niacinamide serum",
    "ceramide moisturizer",
    "pigmentation skincare",
    "skin barrier repair",
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homepageJsonLd),
        }}
      />

      <HeroCarousel />

      <section className="bg-[var(--brand-white)] px-4 py-10 lg:px-8">
        <div className="mx-auto max-w-[1440px]">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-text-muted)]">
              Clinical Skincare
            </p>

            <h1 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">
              Clinical Skincare Powered by Active Ingredients
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--brand-text-muted)] md:text-lg">
              CLINVARA creates dermatologist-tested skincare with ingredient-led
              formulas for pigmentation, hydration, oil control, sensitive skin
              and skin barrier repair. Every product is designed for visible
              results while keeping routines simple, transparent and effective.
            </p>
          </div>
        </div>
      </section>

      <BestSellers />
      <CategoryFilter />
      <ConcernFilter />
      <RoutineStrip />
      <ReviewsSection />
      <SocialFeedStrip />
      <BlogPreview />
    </>
  );
}