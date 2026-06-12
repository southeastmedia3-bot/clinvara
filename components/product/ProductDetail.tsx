"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import { SafeImage } from "@/components/shared/SafeImage";
import { StarRating } from "@/components/shared/StarRating";
import { SizeSelector } from "@/components/product/SizeSelector";
import { useCartStore } from "@/lib/store/cartStore";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { useToast } from "@/components/providers/ToastProvider";
import { ProductGrid } from "@/components/product/ProductGrid";
import { BackButton } from "@/components/ui/BackButton";
import type { Review } from "@/lib/types";
import { isLowStock, isOutOfStock } from "@/lib/productAvailability";
import { getDeliveryEstimate } from "@/lib/delivery/estimate";

export function ProductDetail({
  product,
  relatedProducts = [],
  reviews = [],
}: {
  product: Product;
  relatedProducts?: Product[];
  reviews?: Review[];
}) {
  const gallery = product.gallery ?? [product.image, product.imageHover];
  const [activeImage, setActiveImage] = useState(gallery[0]);
  const [size, setSize] = useState(product.sizes[0] ?? "30ml");
  const [qty, setQty] = useState(1);
  const [openSection, setOpenSection] = useState<string | null>("ingredients");
  const [showFullInci, setShowFullInci] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const toggleWish = useWishlistStore((s) => s.toggle);
  const hasWish = useWishlistStore((s) => s.has(product.id));
  const { showToast } = useToast();

  const outOfStock = isOutOfStock(product);
  const lowStock = isLowStock(product);
  const deliveryEstimate = getDeliveryEstimate({
    dispatchTimeDays: product.dispatchTimeDays ?? 1,
  });

  const highlights =
    product.keyIngredients?.length
      ? product.keyIngredients
      : [
          {
            name: "Key actives",
            benefit: "Selected to support the product's primary skin concern.",
          },
        ];

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 lg:px-8">
      <div className="mb-6">
        <BackButton fallbackHref="/shop" label="Back to Shop" />
      </div>
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="relative aspect-square bg-white p-6">
            <SafeImage
              src={activeImage}
              alt={`${product.name} by CLINVARA for ${product.concerns.join(", ")}`}
              label={product.name}
              fill
              priority
              sizes="(max-width:1024px) 100vw, 50vw"
              className="object-contain"
            />
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto">
            {gallery.map((src, index) => (
              <button
                key={src}
                type="button"
                onClick={() => setActiveImage(src)}
                className={`relative h-20 w-20 shrink-0 border-2 bg-white p-1 ${
                  activeImage === src
                    ? "border-black"
                    : "border-[var(--brand-border)]"
                }`}
              >
                <SafeImage
                  src={src}
                  alt={
                    product.galleryAlt?.[index] ??
                    `${product.name} product image ${index + 1}`
                  }
                  label={product.name}
                  fill
                  sizes="80px"
                  className="object-contain"
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          {product.badge && (
            <span className="mb-2 inline-block bg-[var(--brand-accent)] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
              {product.badge}
            </span>
          )}
          <h1 className="font-display text-[48px] font-light leading-[1.05] tracking-[-0.01em]">
            {product.name}
          </h1>
          <button
            type="button"
            className="mt-2 flex items-center gap-2"
            onClick={() =>
              document
                .getElementById("product-reviews")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <StarRating rating={product.rating} size={14} />
            <span className="text-sm text-[var(--brand-text-muted)] underline">
              {product.reviewCount.toLocaleString()} reviews
            </span>
          </button>
          <p className="mt-4 text-[15px] leading-[1.8] text-zinc-600">
            {product.description}
          </p>
          {outOfStock ? (
            <p className="mt-4 inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-red-700">
              Out of stock
            </p>
          ) : lowStock ? (
            <p className="mt-4 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
              Low stock
            </p>
          ) : null}
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-[32px] font-semibold text-black">
              {formatINR(product.price)}
            </span>
            <span className="text-[16px] text-[var(--brand-mid-gray)] line-through">
              {formatINR(product.mrp)}
            </span>
          </div>

          <div className="mt-6">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em]">Size</p>
            <SizeSelector sizes={product.sizes} value={size} onChange={setSize} />
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center border border-[var(--brand-border)]">
              <button
                type="button"
                aria-label="Decrease quantity"
                className="h-12 w-12 text-lg"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <span className="w-10 text-center text-sm">{qty}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                className="h-12 w-12 text-lg"
                onClick={() => setQty((q) => Math.min(10, q + 1))}
              >
                +
              </button>
            </div>
          </div>

          <button
            type="button"
            disabled={outOfStock}
            className="mt-4 flex h-[52px] w-full items-center justify-center bg-[var(--brand-primary)] text-[11px] font-semibold uppercase tracking-[0.14em] text-white hover:bg-white hover:text-[var(--brand-primary)] hover:ring-1 hover:ring-[var(--brand-primary)] disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-600 disabled:hover:ring-0"
            onClick={() => {
              if (outOfStock) return;
              addItem({
                productId: product.id,
                slug: product.slug,
                name: product.name,
                image: product.image,
                size,
                price: product.price,
                quantity: qty,
                dispatchTimeDays: product.dispatchTimeDays ?? 1,
              });
              showToast({ message: "Added to cart!", variant: "success" });
            }}
          >
            {outOfStock ? "Out of Stock" : "Add to Cart"}
          </button>

          <button
            type="button"
            className="mt-3 flex w-full items-center justify-center gap-2 border border-[var(--brand-border)] py-3 text-[11px] font-semibold uppercase tracking-[0.14em]"
            onClick={() => {
              toggleWish(product.id);
              showToast({
                message: hasWish
                  ? "Removed from wishlist"
                  : "Saved to wishlist",
                variant: hasWish ? "success" : "info",
              });
            }}
          >
            <Star
              className={`h-5 w-5 ${
                hasWish ? "fill-[var(--brand-star)] text-[var(--brand-star)]" : ""
              }`}
            />
            {hasWish ? "In Wishlist" : "Add to Wishlist"}
          </button>

          <div className="mt-8 space-y-2 border-t border-[var(--brand-border)] pt-6">
            <div className="rounded-xl bg-[var(--brand-off-white)] p-4 text-sm">
              <p className="font-semibold">Estimated Delivery</p>
              <p className="mt-1 text-[var(--brand-text-muted)]">
                {deliveryEstimate.label} for most India locations. Final estimate
                updates with your delivery address at checkout.
              </p>
            </div>
            {[
              { id: "ingredients", title: "Key Ingredients" },
              { id: "howto", title: "How to Use" },
              { id: "inci", title: "Full Ingredients List" },
            ].map((sec) => (
              <div key={sec.id} className="border-b border-[var(--brand-border)]">
                <button
                  type="button"
                  className="flex w-full items-center justify-between py-3 text-left text-sm font-semibold"
                  onClick={() =>
                    setOpenSection((s) => (s === sec.id ? null : sec.id))
                  }
                >
                  {sec.title}
                  <span>{openSection === sec.id ? "−" : "+"}</span>
                </button>
                <div hidden={openSection !== sec.id}>
                  {sec.id === "ingredients" && (
                    <ul className="space-y-2 pb-4 text-sm text-[var(--brand-text-muted)]">
                      {highlights.map((h) => (
                        <li key={h.name}>
                          <strong className="text-black">{h.name}:</strong>{" "}
                          {h.benefit}
                        </li>
                      ))}
                    </ul>
                  )}
                  {sec.id === "howto" && (
                    <p className="pb-4 text-sm text-[var(--brand-text-muted)]">
                      {product.howToUse ||
                        "Apply to clean skin as directed for your routine. Follow with moisturizer and use sunscreen in the morning."}{" "}
                      Patch test before first use and reduce frequency if skin
                      feels uncomfortable.
                    </p>
                  )}
                  {sec.id === "inci" && (
                    <div className="pb-4">
                      <p
                        className={`font-mono text-xs leading-relaxed text-[var(--brand-text-muted)] ${
                          showFullInci ? "" : "line-clamp-3"
                        }`}
                      >
                        {product.ingredients ||
                          "Refer to the product packaging for the full ingredient list before use."}
                      </p>
                      <button
                        type="button"
                        className="mt-2 text-xs font-semibold underline"
                        onClick={() => setShowFullInci((v) => !v)}
                      >
                        {showFullInci ? "Show less" : "Show full list"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <p className="mb-4 text-sm font-semibold">What&apos;s Inside</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {highlights.map((h) => (
                <div
                  key={h.name}
                  className="border border-[var(--brand-border)] p-4 text-center"
                >
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-off-white)] text-lg">
                    ✦
                  </div>
                  <p className="text-sm font-semibold">{h.name}</p>
                  <p className="mt-1 text-xs text-[var(--brand-text-muted)]">
                    {h.benefit}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section id="product-reviews" className="mt-16 border-t border-[var(--brand-border)] pt-12">
        <h2 className="font-display text-2xl font-semibold">Customer Reviews</h2>
        {reviews.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--brand-text-muted)]">
            No reviews yet. Be the first to share your experience.
          </p>
        ) : (
          <ul className="mt-6 space-y-4">
            {reviews.map((r) => (
              <li
                key={r.name + r.date}
                className="border border-[var(--brand-border)] p-4"
              >
                <div className="flex justify-between">
                  <span className="font-semibold">{r.name}</span>
                  <span className="text-xs text-[var(--brand-mid-gray)]">
                    {r.date}
                  </span>
                </div>
                <StarRating rating={r.rating} className="mt-2" />
                <p className="mt-2 text-sm font-bold">{r.title}</p>
                <p className="mt-1 text-sm text-[var(--brand-text-muted)]">
                  {r.body}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-16 border-t border-[var(--brand-border)] pt-12">
        <h2 className="font-display text-2xl font-semibold">
          Frequently Asked Questions
        </h2>

        <div className="mt-6 space-y-4">
          <div className="border border-[var(--brand-border)] p-4">
            <h3 className="font-semibold">
              How often should I use {product.name}?
            </h3>
            <p className="mt-2 text-sm text-[var(--brand-text-muted)]">
              Follow the recommended usage instructions on the product page. Most
              skincare products are designed for consistent daily use as part of a
              balanced skincare routine.
            </p>
          </div>

          <div className="border border-[var(--brand-border)] p-4">
            <h3 className="font-semibold">
              Is {product.name} suitable for sensitive skin?
            </h3>
            <p className="mt-2 text-sm text-[var(--brand-text-muted)]">
              Individual skin responses vary. Patch testing before first use is
              recommended, especially for sensitive skin.
            </p>
          </div>

          <div className="border border-[var(--brand-border)] p-4">
            <h3 className="font-semibold">
              Can I use {product.name} with other skincare products?
            </h3>
            <p className="mt-2 text-sm text-[var(--brand-text-muted)]">
              Yes. This product can generally be incorporated into a broader skincare
              routine. Follow product directions and introduce new products gradually.
            </p>
          </div>

          <div className="border border-[var(--brand-border)] p-4">
            <h3 className="font-semibold">
              How long does it take to see results?
            </h3>
            <p className="mt-2 text-sm text-[var(--brand-text-muted)]">
              Results vary depending on skin type, concerns, and consistency of use.
              Maintaining a regular skincare routine is important.
            </p>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-display text-2xl font-semibold">
            You Might Also Like
          </h2>
          <ProductGrid products={relatedProducts} />
        </section>
      )}
    </div>
  );
}