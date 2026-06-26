import type { Review } from "@/lib/types";

export const reviews: Review[] = [
  {
    name: "Rajesh M.",
    verified: true,
    date: "April 2025",
    rating: 5,
    title: "Works nicely on my skin.",
    body: "Been using the Niacinamide serum for 6 weeks. Oiliness is under control and my tone looks more even. Highly recommend!",
    productName: "CLINVARA Acne Reset Serum (Powered by Acnesium™)",
    productSlug: "/shop/niacinamide-10-zinc-serum",
  },
  {
    name: "Priya S.",
    verified: true,
    date: "March 2025",
    rating: 5,
    title: "Gentle, never strips.",
    body: "The NMF cleanser leaves my skin soft—not tight. Perfect morning and night cleanse.",
    productName: "CLINVARA Clear Cleanse (Anti-Acne Face Wash)",
    productSlug: "/shop/nmf-ha-cleanser",
  },
  {
    name: "Ananya K.",
    verified: true,
    date: "February 2025",
    rating: 4,
    title: "Visible results in 3 weeks.",
    body: "Deep Pigmentation Cream has faded my acne marks noticeably. Will keep using consistently.",
    productName: "Deep Pigmentation Cream",
    productSlug: "/shop/deep-pigmentation-cream",
  },
  {
    name: "Meera L.",
    verified: true,
    date: "December 2024",
    rating: 5,
    title: "Barrier feels restored.",
    body: "CLINVARA Barrier Restore Gel (Ceramide Moisturizer) fixed my flaky patches without feeling heavy. Calm, hydrated skin all day.",
    productName: "CLINVARA Barrier Restore Gel (Ceramide Moisturizer)",
    productSlug: "/shop/ceramide-moisture",
  },
];

export function reviewsForProductSlug(slug: string) {
  const path = `/shop/${slug}`;
  return reviews.filter((r) => r.productSlug === path);
}
