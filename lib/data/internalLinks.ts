import { blogs } from "@/lib/data/blogs";
import { allProducts } from "@/lib/data/products";
import type { BlogPost, Product } from "@/lib/types";

export const blogProductLinks: Record<string, string[]> = {
  "skincare-layering-order": [
    "nmf-ha-cleanser",
    "niacinamide-10-zinc-serum",
    "ceramide-moisture",
    "deep-pigmentation-cream",
  ],
  "niacinamide-vs-vitamin-c": ["niacinamide-10-zinc-serum", "deep-pigmentation-cream"],
  "damaged-skin-barrier-signs": ["ceramide-moisture", "nmf-ha-cleanser"],
  "how-to-repair-damaged-skin-barrier": ["ceramide-moisture", "nmf-ha-cleanser"],
  "niacinamide-benefits-indian-skin": ["niacinamide-10-zinc-serum"],
  "best-ingredients-hyperpigmentation-dark-spots": [
    "deep-pigmentation-cream",
    "niacinamide-10-zinc-serum",
  ],
  "ceramides-vs-hyaluronic-acid": ["ceramide-moisture", "nmf-ha-cleanser"],
  "morning-vs-night-skincare-routine": [
    "nmf-ha-cleanser",
    "niacinamide-10-zinc-serum",
    "ceramide-moisture",
    "deep-pigmentation-cream",
  ],
};

export const productBlogLinks: Record<string, string[]> = {
  "niacinamide-10-zinc-serum": [
    "niacinamide-benefits-indian-skin",
    "niacinamide-vs-vitamin-c",
    "best-ingredients-hyperpigmentation-dark-spots",
    "skincare-layering-order",
  ],
  "nmf-ha-cleanser": [
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
  "ceramide-moisture": [
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
