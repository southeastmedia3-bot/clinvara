import { blogs } from "@/lib/data/blogs";
import { allProducts } from "@/lib/data/products";
import type { BlogPost, Product } from "@/lib/types";

export const blogProductLinks: Record<string, string[]> = {
  "skincare-layering-order": [
    "clear-cleanse-face-wash",
    "acne-reset-serum",
    "barrier-restore-gel",
    "deep-pigmentation-cream",
  ],
  "niacinamide-vs-vitamin-c": ["acne-reset-serum", "deep-pigmentation-cream"],
  "damaged-skin-barrier-signs": ["barrier-restore-gel", "clear-cleanse-face-wash"],
  "how-to-repair-damaged-skin-barrier": ["barrier-restore-gel", "clear-cleanse-face-wash"],
  "niacinamide-benefits-indian-skin": ["acne-reset-serum"],
  "best-ingredients-hyperpigmentation-dark-spots": [
    "deep-pigmentation-cream",
    "acne-reset-serum",
  ],
  "ceramides-vs-hyaluronic-acid": ["barrier-restore-gel", "clear-cleanse-face-wash"],
  "morning-vs-night-skincare-routine": [
    "clear-cleanse-face-wash",
    "acne-reset-serum",
    "barrier-restore-gel",
    "deep-pigmentation-cream",
  ],
};

export const productBlogLinks: Record<string, string[]> = {
  "acne-reset-serum": [
    "niacinamide-benefits-indian-skin",
    "niacinamide-vs-vitamin-c",
    "best-ingredients-hyperpigmentation-dark-spots",
    "skincare-layering-order",
  ],
  "clear-cleanse-face-wash": [
    "how-to-repair-damaged-skin-barrier",
    "damaged-skin-barrier-signs",
    "ceramides-vs-hyaluronic-acid",
    "morning-vs-night-skincare-routine",
  ],
  "deep-pigmentation-cream": [
    "best-ingredients-hyperpigmentation-dark-spots",
    "niacinamide-benefits-indian-skin",
    "morning-vs-night-skincare-routine",
  ],
  "barrier-restore-gel": [
    "how-to-repair-damaged-skin-barrier",
    "damaged-skin-barrier-signs",
    "ceramides-vs-hyaluronic-acid",
    "skincare-layering-order",
  ],
};

export function getProductsForBlog(blogSlug: string) {
  const slugs = blogProductLinks[blogSlug] || [];
  return slugs
    .map((slug) => allProducts.find((product) => product.slug === slug))
    .filter((product): product is Product => Boolean(product))
    .slice(0, 4);
}

export function getBlogsForProduct(productSlug: string) {
  const slugs = productBlogLinks[productSlug] || [];
  return slugs
    .map((slug) => blogs.find((blog) => blog.slug === slug))
    .filter((blog): blog is BlogPost => Boolean(blog))
    .slice(0, 4);
}
