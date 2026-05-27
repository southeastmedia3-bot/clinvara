import type { Product } from "@/lib/types";

/** Catalog aligned with CLINVARA product photography */
export const allProducts: Product[] = [
  {
    id: "1",
    name: "Niacinamide 10% Face Serum",
    concern: "Oiliness · Uneven Tone",
    concerns: ["Oiliness", "Pores", "Uneven Tone"],
    concernSlugs: ["oiliness", "pore-minimizing", "uneven-tone"],
    price: 599,
    mrp: 799,
    sizes: ["30ml"],
    image: "/images/products/niacinamide-serum.jpg",
    imageHover: "/images/products/niacinamide-serum-alt.jpg",
    slug: "niacinamide-10-zinc-serum",
    badge: "BESTSELLER",
    rating: 4.7,
    reviewCount: 28,
    category: "serums",
    description:
      "With matmarine, zinc, and acetyl glucosamine. Regulates sebum and evens tone for all skin types.",
    ingredients:
      "Aqua, Niacinamide, Zinc PCA, Acetyl Glucosamine, Sodium Hyaluronate, Pentylene Glycol, Xanthan Gum, Phenoxyethanol.",
    keyIngredients: [
      {
        name: "Niacinamide",
        benefit: "Helps balance excess oil and improve the look of uneven tone.",
      },
      {
        name: "Zinc PCA",
        benefit: "Supports a fresh, comfortable finish for oily-prone skin.",
      },
      {
        name: "Acetyl Glucosamine + HA",
        benefit: "Pairs gentle tone support with light hydration.",
      },
    ],
    howToUse:
      "Apply 2-3 drops to clean, dry skin after cleansing. Follow with moisturizer. Use sunscreen in the morning.",
    gallery: [
      "/images/products/niacinamide-serum.jpg",
      "/images/products/niacinamide-serum-alt.jpg",
    ],
  },
  {
    id: "2",
    name: "Natural Moisturizing Factors + HA Cleanser",
    concern: "Hydration · Gentle Cleanse",
    concerns: ["Dryness", "Dehydration", "Sensitive Skin"],
    concernSlugs: ["dryness-dehydration", "sensitive-skin", "barrier-repair"],
    price: 449,
    mrp: 549,
    sizes: ["100ml", "200ml"],
    image: "/images/products/cleanser-nmf.jpg",
    imageHover: "/images/products/cleanser-nmf-alt.jpg",
    slug: "nmf-ha-cleanser",
    badge: "",
    rating: 4.6,
    reviewCount: 19,
    category: "cleansers",
    description:
      "Surface hydration formula with Natural Moisturizing Factors and hyaluronic acid. Clinical formulations with integrity.",
    ingredients:
      "Aqua, Glycerin, Coco-Glucoside, Sodium Cocoyl Glutamate, Sodium Hyaluronate, Panthenol, Sodium PCA, Amino Acids, Phenoxyethanol.",
    keyIngredients: [
      {
        name: "NMF Complex",
        benefit: "Helps skin feel comfortable after cleansing.",
      },
      {
        name: "Hyaluronic Acid",
        benefit: "Supports a soft, hydrated feel without heaviness.",
      },
      {
        name: "Panthenol + Amino Acids",
        benefit: "Helps maintain a gentle, non-stripping cleanse.",
      },
    ],
    howToUse:
      "Massage onto damp skin for 30-60 seconds, then rinse. Use morning and evening.",
    gallery: [
      "/images/products/cleanser-nmf.jpg",
      "/images/products/cleanser-nmf-alt.jpg",
    ],
  },
  {
    id: "3",
    name: "Deep Pigmentation Cream",
    concern: "Dark Spots · Pigmentation",
    concerns: ["Pigmentation", "Dark Spots", "Uneven Tone"],
    concernSlugs: ["pigmentation", "uneven-tone"],
    price: 649,
    mrp: 849,
    sizes: ["50ml"],
    image: "/images/products/deep-pigmentation-cream.jpg",
    imageHover: "/images/products/deep-pigmentation-cream-alt.jpg",
    slug: "deep-pigmentation-cream",
    badge: "NEW",
    rating: 4.5,
    reviewCount: 16,
    category: "moisturizers",
    description:
      "Targets visible pigmentation with Natural Moisturizing Factors and HA in a surface hydration formula.",
    ingredients:
      "Aqua, Glycerin, Niacinamide, Alpha Arbutin, Tranexamic Acid, Licorice Root Extract, Panthenol, Dimethicone, Phenoxyethanol.",
    keyIngredients: [
      {
        name: "Alpha Arbutin",
        benefit: "Helps improve the look of visible uneven tone.",
      },
      {
        name: "Tranexamic Acid",
        benefit: "Supports a more even-looking complexion with consistent use.",
      },
      {
        name: "Licorice + Panthenol",
        benefit: "Pairs tone-care support with a comfortable skin feel.",
      },
    ],
    howToUse:
      "Apply a thin layer to areas of uneven tone after serum. Use once daily at night to start, and wear sunscreen in the morning.",
    gallery: [
      "/images/products/deep-pigmentation-cream.jpg",
      "/images/products/deep-pigmentation-cream-alt.jpg",
    ],
  },
  {
    id: "4",
    name: "Ceramide Moisture",
    concern: "Barrier Repair · Hydration",
    concerns: ["Barrier Repair", "Dryness", "Sensitivity"],
    concernSlugs: ["barrier-repair", "dryness-dehydration", "sensitive-skin"],
    price: 549,
    mrp: 699,
    sizes: ["50ml"],
    image: "/images/products/ceramide-moisture.jpg",
    imageHover: "/images/products/ceramide-moisture-alt.jpg",
    slug: "ceramide-moisture",
    badge: "BESTSELLER",
    rating: 4.8,
    reviewCount: 31,
    category: "moisturizers",
    description:
      "Ceramide moisture with Natural Moisturizing Factors + HA. Surface hydration formula for comfortable, resilient skin.",
    ingredients:
      "Aqua, Glycerin, Ceramide NP, Ceramide AP, Cholesterol, Fatty Acids, Panthenol, Sodium PCA, Sodium Hyaluronate, Phenoxyethanol.",
    keyIngredients: [
      {
        name: "Ceramides",
        benefit: "Help support the skin barrier and a replenished feel.",
      },
      {
        name: "Cholesterol + Fatty Acids",
        benefit: "Complements ceramides in a barrier-focused moisturizer.",
      },
      {
        name: "NMF + Panthenol",
        benefit: "Adds lasting comfort for dry or sensitive-feeling skin.",
      },
    ],
    howToUse:
      "Apply after serums as the final moisturizing step. Use morning and evening as needed.",
    gallery: [
      "/images/products/ceramide-moisture.jpg",
      "/images/products/ceramide-moisture-alt.jpg",
    ],
  },
];

export const bestSellerIds = ["1", "4", "3", "2"];

export const bestSellers = bestSellerIds
  .map((id) => allProducts.find((p) => p.id === id))
  .filter((p): p is Product => Boolean(p));

export function getProductBySlug(slug: string) {
  return allProducts.find((p) => p.slug === slug);
}

export const categoryFilters = [
  { id: "serums", label: "Serums" },
  { id: "moisturizers", label: "Moisturizers" },
  { id: "cleansers", label: "Cleansers" },
] as const;

export const concernPills = [
  { label: "Uneven Tone", slug: "uneven-tone" },
  { label: "Oiliness", slug: "oiliness" },
  { label: "Pigmentation", slug: "pigmentation" },
  { label: "Dryness & Dehydration", slug: "dryness-dehydration" },
  { label: "Sensitive Skin", slug: "sensitive-skin" },
  { label: "Barrier Repair", slug: "barrier-repair" },
  { label: "Pore Minimizing", slug: "pore-minimizing" },
] as const;

const concernMatch: Record<string, string[]> = {
  "uneven-tone": ["Uneven", "tone", "Dullness", "Pigmentation"],
  oiliness: ["Oiliness"],
  "dryness-dehydration": ["Dryness", "Dehydration"],
  "sensitive-skin": ["Sensitive", "Sensitivity"],
  pigmentation: ["Pigmentation", "Dark Spots"],
  "barrier-repair": ["Barrier"],
  "pore-minimizing": ["Pores", "Pore"],
};

export function productMatchesConcernSlug(
  product: Product,
  concernSlug: string,
) {
  const keys = concernMatch[concernSlug];
  if (!keys) {
    return product.concernSlugs?.includes(concernSlug) ?? false;
  }
  return product.concerns.some((c) =>
    keys.some((k) => c.toLowerCase().includes(k.toLowerCase())),
  );
}

export function productMatchesCategoryParam(
  product: Product,
  param: string,
) {
  if (param === "skin-body") {
    return ["serums", "moisturizers", "cleansers"].includes(product.category);
  }
  if (param === "hair") return false;
  if (param === "bath") return product.category === "cleansers";
  if (param === "lip") return false;
  if (param === "eye") return false;
  return product.category === param;
}
