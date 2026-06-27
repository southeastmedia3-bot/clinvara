import type { Product } from "@/lib/types";

/** Catalog aligned with CLINVARA product photography */
export const allProducts: Product[] = [
  {
    id: "1",
    name: "CLINVARA Acne Reset Serum (Powered by Acnesium)",
    concern: "Oiliness · Uneven Tone",
    concerns: ["Oiliness", "Pores", "Uneven Tone"],
    concernSlugs: ["oiliness", "pore-minimizing", "uneven-tone"],
    price: 599,
    mrp: 799,
    sizes: ["30ml"],
    image: "/images/products/niacinamide-serum.jpg",
    imageHover: "/images/products/niacinamide-serum-alt.jpg",
    slug: "acne-reset-serum",
    badge: "BESTSELLER",
    rating: 4.7,
    reviewCount: 3842,
    category: "serums",
    description:
      "With matmarine, zinc, and acetyl glucosamine. Regulates sebum and evens tone for all skin types.",
    ingredients:
      "Aqua, Niacinamide, Zinc PCA, Acetyl Glucosamine, Matmarine, Pentylene Glycol, Xanthan Gum, Phenoxyethanol.",
    gallery: [
      "/images/products/niacinamide-serum.jpg",
      "/images/products/niacinamide-serum-alt.jpg",
    ],
  },
  {
    id: "2",
    name: "CLINVARA Clear Cleanse (Anti-Acne Face Wash)",
    concern: "Hydration · Gentle Cleanse",
    concerns: ["Dryness", "Dehydration", "Sensitive Skin"],
    concernSlugs: ["dryness-dehydration", "sensitive-skin", "barrier-repair"],
    price: 449,
    mrp: 549,
    sizes: ["100ml", "200ml"],
    image: "/images/products/cleanser-nmf.jpg",
    imageHover: "/images/products/cleanser-nmf-alt.jpg",
    slug: "clear-cleanse-face-wash",
    badge: "",
    rating: 4.6,
    reviewCount: 2100,
    category: "cleansers",
    description:
      "Surface hydration formula with Natural Moisturizing Factors and hyaluronic acid. Clinical formulations with integrity.",
    ingredients:
      "Aqua, Glycerin, Sodium Hyaluronate, Amino Acids, Fatty Acids, Ceramides, Sodium PCA, Phenoxyethanol.",
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
    reviewCount: 1204,
    category: "moisturizers",
    description:
      "Targets visible pigmentation with Natural Moisturizing Factors and HA in a surface hydration formula.",
    ingredients:
      "Aqua, Niacinamide, Alpha Arbutin, Sodium Hyaluronate, Amino Acids, Ceramides, Glycerin, Phenoxyethanol.",
    gallery: [
      "/images/products/deep-pigmentation-cream.jpg",
      "/images/products/deep-pigmentation-cream-alt.jpg",
    ],
  },
  {
    id: "4",
    name: "CLINVARA Barrier Restore Gel (Ceramide Moisturizer)",
    concern: "Barrier Repair · Hydration",
    concerns: ["Barrier Repair", "Dryness", "Sensitivity"],
    concernSlugs: ["barrier-repair", "dryness-dehydration", "sensitive-skin"],
    price: 549,
    mrp: 699,
    sizes: ["50ml"],
    image: "/images/products/ceramide-moisture.jpg",
    imageHover: "/images/products/ceramide-moisture-alt.jpg",
    slug: "barrier-restore-gel",
    badge: "BESTSELLER",
    rating: 4.8,
    reviewCount: 2756,
    category: "moisturizers",
    description:
      "Ceramide moisture with Natural Moisturizing Factors + HA. Surface hydration formula for comfortable, resilient skin.",
    ingredients:
      "Aqua, Ceramide NP, Ceramide AP, Cholesterol, Sodium Hyaluronate, Amino Acids, Glycerin, Phenoxyethanol.",
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
