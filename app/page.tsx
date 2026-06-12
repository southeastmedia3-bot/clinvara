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
import FaqSection from "@/components/home/FaqSection";

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

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is clinical skincare?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Clinical skincare uses scientifically researched ingredients and dermatologist-tested formulations to address specific skin concerns such as pigmentation, dehydration and skin barrier damage.",
      },
    },
    {
      "@type": "Question",
      name: "What does niacinamide do for skin?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Niacinamide helps improve uneven skin tone, reduce the appearance of enlarged pores, support the skin barrier and balance excess oil production.",
      },
    },
    {
      "@type": "Question",
      name: "How do ceramides help the skin barrier?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ceramides help strengthen the skin barrier, reduce moisture loss and improve overall skin resilience.",
      },
    },
    {
      "@type": "Question",
      name: "Which Clinvara products help pigmentation?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Products containing niacinamide and targeted pigmentation ingredients can help improve the appearance of dark spots and uneven skin tone over time.",
      },
    },
    {
      "@type": "Question",
      name: "Can sensitive skin use niacinamide?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Niacinamide is generally well tolerated by most skin types, including sensitive skin, when introduced gradually into a skincare routine.",
      },
    },
    {
      "@type": "Question",
      name: "How often should I use active ingredients?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Usage depends on the ingredient and skin type. Following product directions and building a consistent routine is recommended.",
      },
    },
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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd),
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

      <FaqSection />

      <BlogPreview />
    </>
  );
}