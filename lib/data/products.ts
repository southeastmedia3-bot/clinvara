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
    slug: "niacinamide-10-zinc-serum",
    badge: "BESTSELLER",
    rating: 4.7,
    reviewCount: 24,
    dispatchTimeDays: 1,
    category: "serums",
    description:
      "A dermatologist-inspired niacinamide serum formulated for oily skin, visible pores, uneven tone and post-acne marks. Powered by niacinamide, zinc PCA and hydrating actives to support balanced, clearer-looking skin without heaviness.",
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
        name: "Acetyl Glucosamine",
        benefit: "Complements niacinamide for a more even-looking finish.",
      },
      {
        name: "Hyaluronic Acid",
        benefit: "Adds lightweight hydration without a heavy feel.",
      },
    ],
    howToUse:
      "Apply 2-3 drops to clean, dry skin after cleansing. Follow with moisturizer. Use sunscreen in the morning.",
    gallery: [
      "/images/products/niacinamide-serum.jpg",
      "/images/products/niacinamide-serum-alt.jpg",
    ],
    galleryAlt: [
      "CLINVARA Acne Reset Serum bottle",
      "CLINVARA Acne Reset Serum bottle and texture detail",
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
    slug: "nmf-ha-cleanser",
    badge: "",
    rating: 4.6,
    reviewCount: 19,
    dispatchTimeDays: 1,
    category: "cleansers",
    description:
      "A gentle hydrating cleanser formulated with Natural Moisturizing Factors and hyaluronic acid to cleanse without stripping the skin barrier. Suitable for dry, dehydrated and sensitive skin types.",
    ingredients:
      "Aqua, Glycerin, Coco-Glucoside, Sodium Cocoyl Glutamate, Sodium Hyaluronate, Panthenol, Sodium PCA, Amino Acids, Phenoxyethanol.",
    keyIngredients: [
      {
        name: "Natural Moisturizing Factors",
        benefit: "Helps skin feel comfortable after cleansing.",
      },
      {
        name: "Hyaluronic Acid",
        benefit: "Supports a soft, hydrated feel without heaviness.",
      },
      {
        name: "Panthenol",
        benefit: "Helps maintain a gentle, non-stripping cleanse.",
      },
      {
        name: "Amino Acids",
        benefit: "Supports a soft, conditioned after-feel.",
      },
      {
        name: "Gentle Surfactants",
        benefit: "Lift daily impurities while keeping the cleanse mild.",
      },
    ],
    howToUse:
      "Massage onto damp skin for 30-60 seconds, then rinse. Use morning and evening.",
    gallery: [
      "/images/products/cleanser-nmf.jpg",
      "/images/products/cleanser-nmf-alt.jpg",
    ],
    galleryAlt: [
      "CLINVARA Clear Cleanse product tube",
      "CLINVARA Clear Cleanse texture and product detail",
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
    reviewCount: 12,
    dispatchTimeDays: 1,
    category: "moisturizers",
    description:
      "A clinical pigmentation cream formulated for dark spots, uneven skin tone and post-acne pigmentation using alpha arbutin, kojic acid derivatives and barrier-supporting ingredients.",
    ingredients:
      "Aqua, Glycerin, Alpha Arbutin, Kojic Acid Dipalmitate, Licorice Root Extract, Panthenol, Ceramide NP, Dimethicone, Phenoxyethanol.",
    keyIngredients: [
      {
        name: "Alpha Arbutin",
        benefit: "Helps improve the look of visible uneven tone.",
      },
      {
        name: "Kojic Acid Dipalmitate",
        benefit: "Supports a brighter-looking, more balanced complexion.",
      },
      {
        name: "Licorice Extract",
        benefit: "Helps soothe the look of stressed, uneven skin.",
      },
      {
        name: "Panthenol",
        benefit: "Helps keep targeted tone-care routines comfortable.",
      },
      {
        name: "Ceramides",
        benefit: "Keep the cream comfortable for barrier-focused routines.",
      },
    ],
    howToUse:
      "Apply a thin layer to areas of uneven tone after serum. Use once daily at night to start, and wear sunscreen in the morning.",
    gallery: [
      "/images/products/deep-pigmentation-cream.jpg",
      "/images/products/deep-pigmentation-cream-alt.jpg",
    ],
    galleryAlt: [
      "Deep Pigmentation Cream jar",
      "Deep Pigmentation Cream texture and packaging detail",
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
    slug: "ceramide-moisture",
    badge: "BESTSELLER",
    rating: 4.8,
    reviewCount: 31,
    dispatchTimeDays: 1,
    category: "moisturizers",
    description:
      "A ceramide moisturizer formulated to support skin barrier repair, hydration and long-lasting comfort using ceramides, cholesterol, fatty acids and panthenol.",
    ingredients:
      "Aqua, Glycerin, Ceramide NP, Ceramide AP, Cholesterol, Fatty Acids, Panthenol, Sodium PCA, Sodium Hyaluronate, Phenoxyethanol.",
    keyIngredients: [
      {
        name: "Ceramides",
        benefit: "Help support the skin barrier and a replenished feel.",
      },
      {
        name: "Cholesterol",
        benefit: "Complements ceramides in a barrier-focused moisturizer.",
      },
      {
        name: "Fatty Acids",
        benefit: "Add cushion and comfort for dry-feeling skin.",
      },
      {
        name: "Panthenol",
        benefit: "Helps skin feel calm and comfortable.",
      },
      {
        name: "Natural Moisturizing Factors",
        benefit: "Supports lasting hydration and softness.",
      },
    ],
    howToUse:
      "Apply after serums as the final moisturizing step. Use morning and evening as needed.",
    gallery: [
      "/images/products/ceramide-moisture.jpg",
      "/images/products/ceramide-moisture-alt.jpg",
    ],
    galleryAlt: [
      "CLINVARA Barrier Restore Gel tube",
      "CLINVARA Barrier Restore Gel texture and product detail",
    ],
  },
  {
    id: "5",
    name: "CLINVARA Shield SPF 50+ (Sunscreen)",
    concern: "Sun Protection · UV Damage",
    concerns: [
      "Sun Protection",
      "UV Damage",
      "Tanning",
      "Photoaging",
      "Pigmentation Prevention",
    ],
    concernSlugs: [
      "sun-protection",
      "uv-damage",
      "tanning",
      "photoaging",
      "pigmentation-prevention",
    ],
    price: 599,
    mrp: 799,
    sizes: ["50ml"],
    image: "",
    imageHover: "",
    slug: "shield-spf-50-sunscreen",
    badge: "NEW",
    rating: 4.8,
    reviewCount: 0,
    dispatchTimeDays: 1,
    category: "sunscreen",
    stock: 0,
    lowStockThreshold: 5,
    availability: "out_of_stock",
    featured: false,
    active: true,
    description:
      "CLINVARA Shield SPF 50+ is a lightweight daily sunscreen formulated to provide broad-spectrum protection against UVA and UVB rays. It helps defend the skin from sunburn, tanning, pigmentation, and premature ageing while maintaining hydration. The non-greasy formula blends easily, absorbs quickly, and is suitable for everyday use under makeup or on its own.",
    ingredients:
      "Zinc Oxide, Titanium Dioxide, Niacinamide, Ceramides, Hyaluronic Acid, Vitamin E, Glycerin.",
    keyIngredients: [
      {
        name: "Zinc Oxide",
        benefit: "Helps provide broad-spectrum mineral UV protection.",
      },
      {
        name: "Titanium Dioxide",
        benefit: "Supports daily UVA and UVB protection.",
      },
      {
        name: "Niacinamide",
        benefit: "Helps support an even-looking, comfortable finish.",
      },
      {
        name: "Ceramides",
        benefit: "Support the skin barrier during daily sun-care routines.",
      },
      {
        name: "Hyaluronic Acid",
        benefit: "Adds lightweight hydration without heaviness.",
      },
      {
        name: "Vitamin E",
        benefit: "Provides antioxidant support for everyday exposure.",
      },
      {
        name: "Glycerin",
        benefit: "Helps maintain a soft, hydrated feel.",
      },
    ],
    howToUse:
      "Apply generously to the face and neck 15-20 minutes before sun exposure. Reapply every two hours or after swimming, sweating, or towel drying. For external use only. Avoid direct contact with eyes. Discontinue use if irritation occurs. Keep out of reach of children. Store in a cool, dry place away from direct sunlight.",
    gallery: [],
    galleryAlt: [],
    seoTitle: "CLINVARA Shield SPF 50+ | Broad Spectrum Sunscreen PA++++",
    seoDescription:
      "Protect your skin daily with CLINVARA Shield SPF 50+ PA++++ Sunscreen. Lightweight, non-greasy, broad-spectrum UV protection for all skin types.",
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
  { id: "sunscreen", label: "Sunscreen" },
] as const;

export const concernPills = [
  { label: "Uneven Tone", slug: "uneven-tone" },
  { label: "Oiliness", slug: "oiliness" },
  { label: "Pigmentation", slug: "pigmentation" },
  { label: "Dryness & Dehydration", slug: "dryness-dehydration" },
  { label: "Sensitive Skin", slug: "sensitive-skin" },
  { label: "Barrier Repair", slug: "barrier-repair" },
  { label: "Pore Minimizing", slug: "pore-minimizing" },
  { label: "Sun Protection", slug: "sun-protection" },
  { label: "UV Damage", slug: "uv-damage" },
  { label: "Tanning", slug: "tanning" },
] as const;

const concernMatch: Record<string, string[]> = {
  "uneven-tone": ["Uneven", "tone", "Dullness", "Pigmentation"],
  oiliness: ["Oiliness"],
  "dryness-dehydration": ["Dryness", "Dehydration"],
  "sensitive-skin": ["Sensitive", "Sensitivity"],
  pigmentation: ["Pigmentation", "Dark Spots"],
  "barrier-repair": ["Barrier"],
  "pore-minimizing": ["Pores", "Pore"],
  "sun-protection": ["Sun Protection"],
  "uv-damage": ["UV Damage"],
  tanning: ["Tanning"],
  photoaging: ["Photoaging"],
  "pigmentation-prevention": ["Pigmentation Prevention"],
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
    return ["serums", "moisturizers", "cleansers", "sunscreen"].includes(product.category);
  }
  if (param === "hair") return false;
  if (param === "bath") return product.category === "cleansers";
  if (param === "lip") return false;
  if (param === "eye") return false;
  return product.category === param;
}
