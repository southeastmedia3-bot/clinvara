"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Sparkles, Trash2 } from "lucide-react";
import type { Product } from "@/lib/types";
import { allProducts } from "@/lib/data/products";
import { SafeImage } from "@/components/shared/SafeImage";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { useCartStore } from "@/lib/store/cartStore";
import { useToast } from "@/components/providers/ToastProvider";
import { formatINR } from "@/lib/utils";
import { isOutOfStock } from "@/lib/productAvailability";

export default function WishlistClient() {
  const [products, setProducts] = useState<Product[]>(allProducts);
  const productIds = useWishlistStore((state) => state.productIds);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const addItem = useCartStore((state) => state.addItem);
  const { showToast } = useToast();
  const savedProductIds = useMemo(
    () => Array.from(new Set(productIds.map((id) => String(id).trim()).filter(Boolean))),
    [productIds],
  );

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { products?: Product[] } | null) => {
        if (Array.isArray(data?.products) && data.products.length) {
          setProducts(data.products);
        }
      })
      .catch(() => undefined);
  }, []);

  const wishlistProducts = useMemo(
    () => products.filter((product) => savedProductIds.includes(product.id)),
    [savedProductIds, products],
  );
  const missingSavedCount = Math.max(0, savedProductIds.length - wishlistProducts.length);

  return (
    <main className="mx-auto max-w-[1180px] px-4 py-12 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-text-muted)]">
            Saved Products
          </p>
          <h1 className="mt-2 font-display text-5xl font-semibold">Wishlist</h1>
          <p className="mt-3 text-sm text-[var(--brand-text-muted)]">
            Keep your next CLINVARA routine close, then add products to cart when ready.
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex h-11 items-center justify-center rounded-full border border-black px-5 text-sm font-semibold transition hover:bg-black hover:text-white"
        >
          Continue Shopping
        </Link>
      </div>

      {wishlistProducts.length === 0 ? (
        <section className="mt-10 rounded-3xl border border-dashed border-[var(--brand-border)] bg-white p-10 text-center shadow-sm">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[var(--brand-off-white)]">
            <Heart className="h-7 w-7" />
          </div>
          <h2 className="font-display text-3xl font-semibold">
            Your wishlist is currently empty.
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--brand-text-muted)]">
            Save formulas you are considering and return to them here anytime.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-black px-6 text-sm font-semibold text-white"
          >
            <Sparkles className="h-4 w-4" />
            Continue Shopping
          </Link>
        </section>
      ) : (
        <>
          {missingSavedCount > 0 && (
            <p className="mt-6 rounded-xl bg-[var(--brand-off-white)] p-4 text-sm text-[var(--brand-text-muted)]">
              {missingSavedCount} saved product
              {missingSavedCount === 1 ? " is" : "s are"} no longer available.
            </p>
          )}
          <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {wishlistProducts.map((product) => {
            const outOfStock = isOutOfStock(product);
            const size = product.sizes[0] ?? "30ml";

            return (
              <article
                key={product.id}
                className="group rounded-3xl border border-[var(--brand-border)] bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-black hover:shadow-xl"
              >
                <Link href={`/shop/${product.slug}`} className="block">
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-[var(--brand-off-white)] p-6">
                    <SafeImage
                      src={product.image}
                      alt={product.name}
                      label={product.name}
                      fill
                      sizes="(max-width: 768px) 90vw, 33vw"
                      className="object-contain transition duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                </Link>
                <div className="mt-4">
                  <Link href={`/shop/${product.slug}`} className="font-semibold hover:underline">
                    {product.name}
                  </Link>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--brand-text-muted)]">
                    {product.concern}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="font-semibold">{formatINR(product.price)}</span>
                    <span className="text-sm text-[var(--brand-mid-gray)] line-through">
                      {formatINR(product.mrp)}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-2">
                    <button
                      type="button"
                      disabled={outOfStock}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-black text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-600"
                      onClick={() => {
                        if (outOfStock) return;
                        addItem({
                          productId: product.id,
                          slug: product.slug,
                          name: product.name,
                          image: product.image,
                          size,
                          price: product.price,
                          quantity: 1,
                          dispatchTimeDays: product.dispatchTimeDays ?? 1,
                        });
                        toggleWishlist(product.id);
                        showToast({ message: "Moved to cart.", variant: "success" });
                      }}
                    >
                      <ShoppingBag className="h-4 w-4" />
                      {outOfStock ? "Out of Stock" : "Move to Cart"}
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-black text-sm font-semibold transition hover:bg-black hover:text-white"
                      onClick={() => {
                        toggleWishlist(product.id);
                        showToast({
                          message: "Removed from wishlist.",
                          variant: "success",
                        });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove from Wishlist
                    </button>
                  </div>
                </div>
              </article>
            );
            })}
          </section>
        </>
      )}
    </main>
  );
}
