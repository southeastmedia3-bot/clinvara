import type { BlogPost } from "@/lib/types";

export const blogs: BlogPost[] = [
  {
    title: "The Right Order to Layer Your Skincare Products",
    excerpt:
      "Layering skincare incorrectly can reduce effectiveness. Here's the exact sequence from cleanser to SPF for maximum results.",
    tag: "SKINCARE GUIDE",
    date: "May 10, 2025",
    image: "/images/blog/rt_order.png",
    slug: "skincare-layering-order",
    content: [
      "Start with the thinnest, most water-like textures and finish with occlusives and sunscreen in the morning.",
      "A practical rule: cleanse, treat with serums, moisturize, then SPF. Wait a minute between actives if your skin is sensitive.",
      "At night, swap SPF for a nourishing cream or facial oil if your routine calls for it.",
    ],
  },
  {
    title: "Niacinamide vs Vitamin C — Can You Use Both?",
    excerpt:
      "Two of the most loved actives in skincare. We break down the myths and tell you the truth about combining them safely.",
    tag: "INGREDIENT SCIENCE",
    date: "April 22, 2025",
    image: "/images/blog/vs.png",
    slug: "niacinamide-vs-vitamin-c",
    content: [
      "Niacinamide supports barrier function and sebum balance, while vitamin C targets oxidative stress and uneven tone.",
      "Most skin types can use both in the same routine—try vitamin C in the morning and niacinamide at night if you prefer simplicity.",
      "Patch test when introducing multiple actives and increase frequency gradually.",
    ],
  },
  {
    title: "5 Signs Your Skin Barrier Is Damaged (And How to Fix It)",
    excerpt:
      "Redness, sensitivity, and breakouts might not mean acne. They could mean a damaged skin barrier that needs repair, not more stripping.",
    tag: "SKIN HEALTH",
    date: "April 5, 2025",
    image: "/images/blog/barr.png",
    slug: "damaged-skin-barrier-signs",
    content: [
      "1. Products that used to feel comfortable now sting, tingle, or burn after application.",
      "2. Skin looks flaky, tight, or rough even after moisturizing.",
      "3. Redness or warmth appears more often than usual, especially after cleansing.",
      "4. Breakouts or bumps appear alongside dryness, which can be a sign of irritation rather than only acne.",
      "5. Your skin feels shiny but dehydrated, with makeup or sunscreen sitting unevenly.",
      "To support recovery, simplify your routine: use a gentle cleanser, a ceramide or panthenol moisturizer, and daily sunscreen. Pause strong exfoliants and introduce actives slowly once comfort returns.",
    ],
  },
];

export function getBlogBySlug(slug: string) {
  return blogs.find((b) => b.slug === slug);
}
