"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { bestSellers } from "@/lib/data/products";
import { ProductGrid } from "@/components/product/ProductGrid";

export function BestSellers() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 800);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <section id="best-sellers" className="mx-auto max-w-[1440px] px-4 py-6 lg:px-8">
      <header className="mb-8 mt-14 md:mt-[60px]">
        <h2 className="font-display text-3xl font-semibold md:text-4xl">
          Our Best Sellers
        </h2>
        <div className="mt-2 h-0.5 w-12 bg-black" />
      </header>

      {!ready ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3 border border-[var(--brand-border)] p-3">
              <div className="aspect-square skeleton" />
              <div className="h-4 skeleton" />
              <div className="h-3 w-2/3 skeleton" />
              <div className="h-10 skeleton" />
            </div>
          ))}
        </div>
      ) : (
        <ProductGrid products={bestSellers} />
      )}

      <div className="mt-6 flex justify-end">
        <Link href="/shop" className="text-sm font-semibold underline">
          View All Products →
        </Link>
      </div>
    </section>
  );
}
