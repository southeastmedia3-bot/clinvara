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
      "Stinging with previously tolerated products, visible flaking, and persistent redness are common barrier signals.",
      "Focus on ceramides, panthenol, and gentle cleansing while pausing strong exfoliants for two weeks.",
      "Reintroduce actives slowly once comfort returns.",
    ],
  },
];

export function getBlogBySlug(slug: string) {
  return blogs.find((b) => b.slug === slug);
}
