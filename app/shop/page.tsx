import Link from "next/link";
import type { Metadata } from "next";
import {
  allProducts,
  bestSellerIds,
  categoryFilters,
  concernPills,
  getProductBySlug,
  productMatchesCategoryParam,
  productMatchesConcernSlug,
} from "@/lib/data/products";
import { routines } from "@/lib/data/routines";
import { ProductGrid } from "@/components/product/ProductGrid";
import type { Product } from "@/lib/types";

type SearchValue = string | string[] | undefined;
type ShopSearchParams = Record<string, SearchValue>;

type ShopPageProps = {
  searchParams?: ShopSearchParams;
};

type SortKey = "relevance" | "price-asc" | "price-desc" | "newest" | "rating";

export const metadata: Metadata = {
  title: "Shop All Products",
  description:
    "Browse CLINVARA serums, moisturizers, cleansers, and clinical skincare routines by concern, category, and price.",
  alternates: { canonical: "/shop" },
  openGraph: {
    title: "Shop All Products | CLINVARA",
    description:
      "Browse CLINVARA skincare products by concern, category, and price.",
    url: "/shop",
  },
  twitter: {
    title: "Shop All Products | CLINVARA",
    description:
      "Browse CLINVARA serums, moisturizers, cleansers, and clinical skincare routines.",
  },
};

function firstParam(value: SearchValue) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function allParams(value: SearchValue) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function filterProducts(searchParams: ShopSearchParams = {}) {
  const filter = firstParam(searchParams.filter);
  const category = firstParam(searchParams.category);
  const concern = firstParam(searchParams.concern);
  const routine = firstParam(searchParams.routine);
  const sort = (firstParam(searchParams.sort) || "relevance") as SortKey;
  const minPrice = Number(firstParam(searchParams.minPrice) || "0");
  const maxPrice = Number(firstParam(searchParams.maxPrice) || "9999");
  const minRating = Number(firstParam(searchParams.minRating) || "0");
  const categories = allParams(searchParams.cat);
  const concerns = allParams(searchParams.c);

  let products: Product[] = [...allProducts];

  if (filter === "bestsellers") {
    products = products.filter((product) => bestSellerIds.includes(product.id));
  }

  if (category) {
    products = products.filter((product) =>
      productMatchesCategoryParam(product, category),
    );
  }

  if (concern) {
    products = products.filter((product) =>
      productMatchesConcernSlug(product, concern),
    );
  }

  if (routine) {
    const routineProducts =
      routines
        .find((item) => item.id === routine)
        ?.steps.map((step) => getProductBySlug(step.slug))
        .filter((product): product is Product => Boolean(product)) ?? [];

    if (routineProducts.length) {
      const ids = new Set(routineProducts.map((product) => product.id));
      products = products.filter((product) => ids.has(product.id));
    }
  }

  if (categories.length) {
    products = products.filter((product) => categories.includes(product.category));
  }

  if (concerns.length) {
    products = products.filter((product) =>
      concerns.some((slug) => productMatchesConcernSlug(product, slug)),
    );
  }

  products = products.filter(
    (product) =>
      product.price >= minPrice &&
      product.price <= maxPrice &&
      product.rating >= minRating,
  );

  switch (sort) {
    case "price-asc":
      products.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      products.sort((a, b) => b.price - a.price);
      break;
    case "newest":
      products.sort((a, b) => Number(b.id) - Number(a.id));
      break;
    case "rating":
      products.sort((a, b) => b.rating - a.rating);
      break;
    default:
      break;
  }

  return { products, filter, category, concern, routine, sort };
}

function filterHref(next: Record<string, string>) {
  const params = new URLSearchParams(next);
  return `/shop${params.size ? `?${params.toString()}` : ""}`;
}

function activeLabel({
  filter,
  category,
  concern,
  routine,
}: {
  filter: string;
  category: string;
  concern: string;
  routine: string;
}) {
  if (filter === "bestsellers") return "Best Sellers";
  if (routine) return routines.find((item) => item.id === routine)?.title ?? routine;
  if (concern) return concernPills.find((item) => item.slug === concern)?.label ?? concern;
  if (category) return categoryFilters.find((item) => item.id === category)?.label ?? category;
  return "All Products";
}

export default function ShopPage({ searchParams = {} }: ShopPageProps) {
  const { products, filter, category, concern, routine, sort } =
    filterProducts(searchParams);
  const hasProducts = products.length > 0;
  const currentLabel = activeLabel({ filter, category, concern, routine });

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-text-muted)]">
            {currentLabel}
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold">Shop</h1>
          <p className="mt-2 text-sm text-[var(--brand-text-muted)]">
            {hasProducts ? `${products.length} products` : "No matching products"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/shop"
            className="rounded-full border border-[var(--brand-border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] hover:border-black"
          >
            All
          </Link>
          <Link
            href="/shop?filter=bestsellers"
            className="rounded-full border border-[var(--brand-border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] hover:border-black"
          >
            Best Sellers
          </Link>
          <Link
            href="/shop?category=skin-body"
            className="rounded-full border border-[var(--brand-border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] hover:border-black"
          >
            Skin & Body
          </Link>
        </div>
      </div>

      <div className="mb-6 grid gap-3 border-y border-[var(--brand-border)] py-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex flex-wrap gap-2">
          {categoryFilters.map((item) => (
            <Link
              key={item.id}
              href={filterHref({ category: item.id })}
              className="rounded-full bg-[var(--brand-off-white)] px-3 py-2 text-xs font-semibold hover:bg-black hover:text-white"
            >
              {item.label}
            </Link>
          ))}
          {concernPills.slice(0, 5).map((item) => (
            <Link
              key={item.slug}
              href={filterHref({ concern: item.slug })}
              className="rounded-full bg-[var(--brand-off-white)] px-3 py-2 text-xs font-semibold hover:bg-black hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-semibold text-[var(--brand-text-muted)]">
          {[
            ["Relevance", "relevance"],
            ["Price Low", "price-asc"],
            ["Price High", "price-desc"],
            ["Rating", "rating"],
          ].map(([label, value]) => (
            <Link
              key={value}
              href={filterHref({
                ...(filter ? { filter } : {}),
                ...(category ? { category } : {}),
                ...(concern ? { concern } : {}),
                ...(routine ? { routine } : {}),
                sort: value,
              })}
              className={`rounded-full px-3 py-2 ${
                sort === value ? "bg-black text-white" : "bg-[var(--brand-off-white)]"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {hasProducts ? (
        <ProductGrid products={products} mobileColumns={1} />
      ) : (
        <section className="rounded-2xl border border-[var(--brand-border)] bg-white p-8 text-center">
          <h2 className="font-display text-3xl font-semibold">
            No products found
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--brand-text-muted)]">
            Try clearing filters or browsing all CLINVARA products. The shop is
            still available even if a filter returns no matches.
          </p>
          <Link
            href="/shop"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white"
          >
            View All Products
          </Link>
        </section>
      )}
    </div>
  );
}
