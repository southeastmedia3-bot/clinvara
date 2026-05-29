"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
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
    () => debounce((val: string) => setDebounced(val), 300),
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
    const matchedProducts = products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.concerns.some((c) => c.toLowerCase().includes(term)) ||
        p.category.toLowerCase().includes(term) ||
        (p.ingredients ?? "").toLowerCase().includes(term) ||
        (p.keyIngredients ?? []).some((ingredient) =>
          `${ingredient.name} ${ingredient.benefit}`.toLowerCase().includes(term),
        ),
    );
    const concerns = Array.from(
      new Set(
        products.flatMap((p) =>
          p.concerns.filter((c) => c.toLowerCase().includes(term)),
        ),
      ),
    ).slice(0, 6);
    const posts = blogs.filter(
      (b) =>
        b.title.toLowerCase().includes(term) ||
        b.excerpt.toLowerCase().includes(term) ||
        b.tag.toLowerCase().includes(term),
    );
    return { products: matchedProducts, concerns, posts };
  }, [debounced, products]);

  if (!open) return null;

  const empty =
    debounced.trim().length > 0 &&
    results.products.length === 0 &&
    results.concerns.length === 0 &&
    results.posts.length === 0;

  return (
    <div className="fixed inset-0 z-[180] bg-white">
      <div className="mx-auto flex max-w-3xl flex-col px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products, ingredients, concerns..."
            className="font-display w-full border-b border-black py-2 text-2xl outline-none md:text-3xl"
            aria-label="Search"
          />
          <button
            type="button"
            aria-label="Close search"
            className="ml-4 shrink-0"
            onClick={onClose}
          >
            <X className="h-8 w-8" />
          </button>
        </div>

        {empty && (
          <p className="text-sm text-[var(--brand-text-muted)]">
            No results. Try &quot;niacinamide&quot;, &quot;sunscreen&quot;, or
            &quot;hair serum&quot;.
          </p>
        )}

        {results.products.length > 0 && (
          <section className="mb-8">
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--brand-text-muted)]">
              Products
            </h3>
            <ul className="space-y-3">
              {results.products.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/shop/${p.slug}`}
                    className="flex gap-3 rounded-sm border border-transparent hover:border-[var(--brand-border)]"
                    onClick={onClose}
                  >
                    <div className="relative h-14 w-14 shrink-0 bg-[var(--brand-off-white)]">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        className="object-contain p-1"
                        sizes="56px"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-[var(--brand-mid-gray)]">
                        {p.category} · {formatINR(p.price)}
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
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--brand-text-muted)]">
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
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--brand-text-muted)]">
              Blog Posts
            </h3>
            <ul className="space-y-3">
              {results.posts.map((b) => (
                <li key={b.slug}>
                  <Link
                    href={`/blog/${b.slug}`}
                    className="text-sm font-medium hover:underline"
                    onClick={onClose}
                  >
                    {b.title}
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
