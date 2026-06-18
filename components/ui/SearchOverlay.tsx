"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { allProducts } from "@/lib/data/products";
import { blogs } from "@/lib/data/blogs";
import { debounce, formatINR } from "@/lib/utils";
import type { Product } from "@/lib/types";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function SearchOverlay({ open, onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [products, setProducts] = useState<Product[]>(allProducts);

  const pushDebounced = useMemo(
    () => debounce((val: string) => setDebounced(val), 220),
    [],
  );

  useEffect(() => {
    pushDebounced(q);
  }, [q, pushDebounced]);

  useEffect(() => {
    if (!open) {
      setQ("");
      setDebounced("");
      return;
    }
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    fetch("/api/products", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { products?: Product[] } | null) => {
        if (Array.isArray(data?.products) && data.products.length) {
          setProducts(data.products);
        }
      })
      .catch(() => undefined);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const results = useMemo(() => {
    const term = debounced.trim().toLowerCase();
    if (!term) return { products: [], concerns: [] as string[], posts: [] };
    const matchedProducts = products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.concerns.some((c) => c.toLowerCase().includes(term)) ||
          p.category.toLowerCase().includes(term) ||
          (p.ingredients ?? "").toLowerCase().includes(term) ||
          (p.keyIngredients ?? []).some((ingredient) =>
            `${ingredient.name} ${ingredient.benefit}`.toLowerCase().includes(term),
          ),
      )
      .slice(0, 8);
    const concerns = Array.from(
      new Set(
        products.flatMap((p) =>
          p.concerns.filter((c) => c.toLowerCase().includes(term)),
        ),
      ),
    ).slice(0, 6);
    const posts = blogs
      .filter(
        (b) =>
          b.title.toLowerCase().includes(term) ||
          b.excerpt.toLowerCase().includes(term) ||
          b.tag.toLowerCase().includes(term),
      )
      .slice(0, 5);
    return { products: matchedProducts, concerns, posts };
  }, [debounced, products]);

  if (!open) return null;

  const suggestions = [
    "Niacinamide",
    "Barrier repair",
    "Pigmentation",
    "Cleanser",
    "Ceramides",
    "Sensitive skin",
  ];
  const suggestedProducts = products.slice(0, 4);
  const empty =
    debounced.trim().length > 0 &&
    results.products.length === 0 &&
    results.concerns.length === 0 &&
    results.posts.length === 0;

  return (
    <div className="fixed inset-0 z-[180] overflow-y-auto bg-white">
      <div className="mx-auto flex max-w-4xl flex-col px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex w-full items-center gap-3 rounded-full border border-black px-4">
            <Search className="h-5 w-5 shrink-0" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products, ingredients, concerns..."
              className="h-14 w-full bg-transparent font-display text-xl outline-none md:text-2xl"
              aria-label="Search"
            />
          </div>
          <button
            type="button"
            aria-label="Close search"
            className="ml-4 grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[var(--brand-border)]"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {!debounced.trim() && (
          <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr]">
            <section>
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--brand-text-muted)]">
                Popular Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setQ(suggestion)}
                    className="rounded-full border border-[var(--brand-border)] px-4 py-2 text-sm font-semibold transition hover:border-black hover:bg-black hover:text-white"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--brand-text-muted)]">
                Quick Product Discovery
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {suggestedProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/shop/${product.slug}`}
                    onClick={onClose}
                    className="flex gap-3 rounded-2xl border border-[var(--brand-border)] p-3 transition hover:border-black"
                  >
                    <div className="relative h-16 w-16 shrink-0 rounded-xl bg-[var(--brand-off-white)]">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain p-2"
                        sizes="64px"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-1 text-sm font-semibold">{product.name}</p>
                      <p className="mt-1 text-xs text-[var(--brand-text-muted)]">
                        {formatINR(product.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        )}

        {empty && (
          <p className="text-sm text-[var(--brand-text-muted)]">
            No results. Try &quot;niacinamide&quot;, &quot;barrier repair&quot;, or
            &quot;pigmentation&quot;.
          </p>
        )}

        {results.products.length > 0 && (
          <section className="mb-8">
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--brand-text-muted)]">
              Products
            </h3>
            <ul className="grid gap-3 sm:grid-cols-2">
              {results.products.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/shop/${p.slug}`}
                    className="flex gap-3 rounded-2xl border border-[var(--brand-border)] p-3 transition hover:border-black"
                    onClick={onClose}
                  >
                    <div className="relative h-16 w-16 shrink-0 rounded-xl bg-[var(--brand-off-white)]">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        className="object-contain p-2"
                        sizes="64px"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-1 text-sm font-semibold">{p.name}</p>
                      <p className="text-xs text-[var(--brand-mid-gray)]">
                        {p.category} - {formatINR(p.price)}
                      </p>
                      <p className="mt-1 line-clamp-1 text-xs text-[var(--brand-text-muted)]">
                        {p.concern}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {results.concerns.length > 0 && (
          <section className="mb-8">
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--brand-text-muted)]">
              Concerns
            </h3>
            <ul className="flex flex-wrap gap-2">
              {results.concerns.map((c) => (
                <li key={c}>
                  <Link
                    href={`/shop?concern=${encodeURIComponent(
                      c.toLowerCase().replace(/\s+/g, "-"),
                    )}`}
                    className="inline-block rounded-full border border-[var(--brand-border)] px-3 py-1 text-sm hover:bg-black hover:text-white"
                    onClick={onClose}
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {results.posts.length > 0 && (
          <section>
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--brand-text-muted)]">
              Blog Posts
            </h3>
            <ul className="space-y-3">
              {results.posts.map((b) => (
                <li key={b.slug}>
                  <Link
                    href={`/blog/${b.slug}`}
                    className="block rounded-2xl border border-[var(--brand-border)] p-4 text-sm font-medium hover:border-black"
                    onClick={onClose}
                  >
                    <span className="block font-semibold">{b.title}</span>
                    <span className="mt-1 line-clamp-2 block text-xs text-[var(--brand-text-muted)]">
                      {b.excerpt}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
