import type { Metadata } from "next";
import { getStorefrontProducts } from "@/lib/firebase/products";
import SkinAnalysisClient from "@/app/skin-analysis/SkinAnalysisClient";

export const metadata: Metadata = {
  title: "Skin Analysis & Routine Builder | CLINVARA",
  description:
    "Build a personalized CLINVARA skincare routine based on your skin type, concerns, sensitivity, lifestyle, and goals.",
  alternates: {
    canonical: "/skin-analysis",
  },
  openGraph: {
    title: "Skin Analysis & Routine Builder | CLINVARA",
    description:
      "Get a personalized skincare routine tailored to your skin type, concerns, and lifestyle in under 2 minutes.",
    url: "/skin-analysis",
    siteName: "CLINVARA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Skin Analysis & Routine Builder | CLINVARA",
    description:
      "Get a personalized skincare routine tailored to your skin type, concerns, and lifestyle in under 2 minutes.",
  },
};

const skinAnalysisJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "CLINVARA Skin Analysis & Routine Builder",
  url: "https://clinvara.global/skin-analysis",
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Web",
  description:
    "A rule-based skincare routine builder that recommends CLINVARA products based on skin type, concerns, sensitivity, lifestyle, and goals.",
  provider: {
    "@type": "Organization",
    name: "CLINVARA",
    url: "https://clinvara.global",
  },
};

export default async function SkinAnalysisPage() {
  const products = await getStorefrontProducts();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(skinAnalysisJsonLd),
        }}
      />
      <SkinAnalysisClient products={products} />
    </>
  );
}
