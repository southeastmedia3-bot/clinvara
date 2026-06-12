import type { Metadata } from "next";

import { HeroCarousel } from "@/components/home/HeroCarousel";
import { BestSellers } from "@/components/home/BestSellers";
import { CategoryFilter } from "@/components/home/CategoryFilter";
import { ConcernFilter } from "@/components/home/ConcernFilter";
import { RoutineStrip } from "@/components/home/RoutineStrip";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { SocialFeedStrip } from "@/components/home/SocialFeedStrip";
import { BlogPreview } from "@/components/home/BlogPreview";

import ClinicalSkincareSection from "@/components/home/ClinicalSkincareSection";
import WhyChooseClinvara from "@/components/home/WhyChooseClinvara";
import SkinConcernsSection from "@/components/home/SkinConcernsSection";

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

      <ClinicalSkincareSection />

      <BestSellers />

      <WhyChooseClinvara />

      <CategoryFilter />

      <ConcernFilter />

      <RoutineStrip />

      <ReviewsSection />

      <SocialFeedStrip />

      <SkinConcernsSection />

      <BlogPreview />
    </>
  );
}