"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { X, SlidersHorizontal } from "lucide-react";
import {
  allProducts,
  bestSellerIds,
  categoryFilters,
  concernPills,
  productMatchesCategoryParam,
  productMatchesConcernSlug,
} from "@/lib/data/products";
import { ProductGrid } from "@/components/product/ProductGrid";
import { useIntersectionObserver } from "@/lib/hooks/useIntersectionObserver";
import type { Product } from "@/lib/types";

const PAGE_SIZE = 6;

type SortKey =
  | "relevance"
  | "price-asc"
  | "price-desc"
  | "newest"
  | "rating";

export function ShopPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const category = searchParams.get("category") ?? "";
  const concern = searchParams.get("concern") ?? "";
  const filter = searchParams.get("filter") ?? "";
  const sort = (searchParams.get("sort") as SortKey) ?? "relevance";
  const minPrice = Number(searchParams.get("minPrice") ?? "0");
  const maxPrice = Number(searchParams.get("maxPrice") ?? "9999");
  const minRating = Number(searchParams.get("minRating") ?? "0");
  const categoriesParam = searchParams.getAll("cat");
  const concernsParam = searchParams.getAll("c");

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 800);
    return () => window.clearTimeout(t);
  }, []);

  const updateParams = useCallback(
    (mutate: (p: URLSearchParams) => void) => {
      const p = new URLSearchParams(searchParams.toString());
      mutate(p);
      router.push(`/shop?${p.toString()}`, { scroll: false });
      setVisibleCount(PAGE_SIZE);
    },
    [router, searchParams],
  );

  const filtered = useMemo(() => {
    let list: Product[] = [...allProducts];
    if (filter === "bestsellers") {
      list = list.filter((p) => bestSellerIds.includes(p.id));
    }
    if (category) {
      list = list.filter((p) => productMatchesCategoryParam(p, category));
    }
    if (concern) {
      list = list.filter((p) => productMatchesConcernSlug(p, concern));
    }
    if (categoriesParam.length) {
      list = list.filter((p) => categoriesParam.includes(p.category));
    }
    if (concernsParam.length) {
      list = list.filter((p) =>
        concernsParam.some((slug) => productMatchesConcernSlug(p, slug)),
      );
    }
    list = list.filter(
      (p) => p.price >= minPrice && p.price <= maxPrice && p.rating >= minRating,
    );
    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        list.sort((a, b) => Number(b.id) - Number(a.id));
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }
    return list;
  }, [
    filter,
    category,
    concern,
    categoriesParam,
    concernsParam,
    minPrice,
    maxPrice,
    minRating,
    sort,
  ]);

  const catalog = allProducts.length ? allProducts : [];
  const visible = filtered.slice(0, visibleCount);
  const { ref: sentinelRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    rootMargin: "200px",
  });

  useEffect(() => {
    if (isIntersecting && visibleCount < filtered.length) {
      setVisibleCount((c) => Math.min(c + PAGE_SIZE, filtered.length));
    }
  }, [isIntersecting, visibleCount, filtered.length]);

  const activePills = useMemo(() => {
    const pills: { key: string; label: string }[] = [];
    if (filter === "bestsellers") pills.push({ key: "filter", label: "Best Sellers" });
    if (category) pills.push({ key: "category", label: `Category: ${category}` });
    if (concern) {
      const label =
        concernPills.find((c) => c.slug === concern)?.label ?? concern;
      pills.push({ key: "concern", label });
    }
    categoriesParam.forEach((c) =>
      pills.push({
        key: `cat-${c}`,
        label: categoryFilters.find((x) => x.id === c)?.label ?? c,
      }),
    );
    concernsParam.forEach((c) =>
      pills.push({
        key: `c-${c}`,
        label: concernPills.find((x) => x.slug === c)?.label ?? c,
      }),
    );
    if (minRating > 0) pills.push({ key: "minRating", label: `${minRating}+ stars` });
    if (minPrice > 0 || maxPrice < 9999) {
      pills.push({ key: "price", label: `₹${minPrice}–₹${maxPrice}` });
    }
    return pills;
  }, [filter, category, concern, categoriesParam, concernsParam, minRating, minPrice, maxPrice]);

  const removePill = (key: string) => {
    updateParams((p) => {
      if (key === "filter") p.delete("filter");
      if (key === "category") p.delete("category");
      if (key === "concern") p.delete("concern");
      if (key === "minRating") p.delete("minRating");
      if (key === "price") {
        p.delete("minPrice");
        p.delete("maxPrice");
      }
      if (key.startsWith("cat-")) {
        const id = key.replace("cat-", "");
        const next = p.getAll("cat").filter((x) => x !== id);
        p.delete("cat");
        next.forEach((v) => p.append("cat", v));
      }
      if (key.startsWith("c-")) {
        const id = key.replace("c-", "");
        const next = p.getAll("c").filter((x) => x !== id);
        p.delete("c");
        next.forEach((v) => p.append("c", v));
      }
    });
  };

  const sidebar = (
    <aside className="space-y-8 text-sm">
      <div>
        <p className="mb-3 font-semibold">Category</p>
        {categoryFilters.map((c) => {
          const checked = categoriesParam.includes(c.id);
          return (
            <label key={c.id} className="mb-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={checked}
                onChange={() =>
                  updateParams((p) => {
                    const cur = p.getAll("cat");
                    p.delete("cat");
                    if (checked) {
                      cur.filter((x) => x !== c.id).forEach((v) => p.append("cat", v));
                    } else {
                      [...cur, c.id].forEach((v) => p.append("cat", v));
                    }
                  })
                }
              />
              {c.label}
            </label>
          );
        })}
      </div>
      <div>
        <p className="mb-3 font-semibold">Concern</p>
        {concernPills.map((c) => {
          const checked = concernsParam.includes(c.slug);
          return (
            <label key={c.slug} className="mb-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={checked}
                onChange={() =>
                  updateParams((p) => {
                    const cur = p.getAll("c");
                    p.delete("c");
                    if (checked) {
                      cur.filter((x) => x !== c.slug).forEach((v) => p.append("c", v));
                    } else {
                      [...cur, c.slug].forEach((v) => p.append("c", v));
                    }
                  })
                }
              />
              {c.label}
            </label>
          );
        })}
      </div>
      <div>
        <p className="mb-2 font-semibold">
          Price: ₹{minPrice} – ₹{maxPrice}
        </p>
        <input
          type="range"
          min={0}
          max={1000}
          value={maxPrice}
          className="w-full"
          onChange={(e) =>
            updateParams((p) => p.set("maxPrice", e.target.value))
          }
        />
      </div>
      <div>
        <p className="mb-2 font-semibold">Minimum rating</p>
        {[4, 3, 0].map((r) => (
          <label key={r} className="mb-2 flex items-center gap-2">
            <input
              type="radio"
              name="rating"
              checked={minRating === r}
              onChange={() =>
                updateParams((p) => {
                  if (r === 0) p.delete("minRating");
                  else p.set("minRating", String(r));
                })
              }
            />
            {r === 0 ? "Any" : `${r}+ stars`}
          </label>
        ))}
      </div>
    </aside>
  );

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 lg:px-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold">Shop</h1>
          <p className="mt-1 text-sm text-[var(--brand-text-muted)]">
            {ready ? filtered.length : catalog.length} products
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 border border-[var(--brand-border)] px-3 py-2 text-sm md:hidden"
            onClick={() => setMobileFilters(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
          <select
            aria-label="Sort products"
            className="border border-[var(--brand-border)] px-3 py-2 text-sm"
            value={sort}
            onChange={(e) =>
              updateParams((p) => p.set("sort", e.target.value))
            }
          >
            <option value="relevance">Relevance</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {activePills.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {activePills.map((pill) => (
            <button
              key={pill.key}
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-[var(--brand-border)] px-3 py-1 text-xs font-medium"
              onClick={() => removePill(pill.key)}
            >
              {pill.label}
              <X className="h-3 w-3" />
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <div className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
          {sidebar}
        </div>

        {!ready ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square skeleton" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div>
            <ProductGrid products={visible} />
            <div ref={sentinelRef} className="h-8" />
            {visibleCount < filtered.length && (
              <p className="py-4 text-center text-sm text-[var(--brand-text-muted)]">
                Loading more…
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--brand-border)] bg-white p-8 text-center">
            <h2 className="font-display text-3xl font-semibold">
              No products found
            </h2>
            <p className="mt-2 text-sm text-[var(--brand-text-muted)]">
              Try clearing filters or browsing all CLINVARA products.
            </p>
            <button
              type="button"
              className="mt-5 h-11 rounded-full bg-black px-6 text-sm font-semibold text-white"
              onClick={() => router.push("/shop")}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {mobileFilters && (
        <div className="fixed inset-0 z-[140] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close filters"
            onClick={() => setMobileFilters(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-semibold">Filters</p>
              <button type="button" onClick={() => setMobileFilters(false)}>
                <X />
              </button>
            </div>
            {sidebar}
            <button
              type="button"
              className="mt-6 w-full bg-black py-3 text-sm font-semibold text-white"
              onClick={() => setMobileFilters(false)}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
