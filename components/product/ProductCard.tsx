"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Star } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cartStore";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { useToast } from "@/components/providers/ToastProvider";
import { SafeImage } from "@/components/shared/SafeImage";
import { isLowStock, isOutOfStock } from "@/lib/productAvailability";

export function ProductCard({
  product,
  layout = "grid",
}: {
  product: Product;
  layout?: "grid" | "scroll";
}) {
  const [hover, setHover] = useState(false);
  const [flying, setFlying] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const hasWish = useWishlistStore((s) => s.has(product.id));

  const { showToast } = useToast();

  const size = product.sizes[0] ?? "30ml";
  const outOfStock = isOutOfStock(product);
  const lowStock = isLowStock(product);

  const onAdd = () => {
    if (outOfStock) {
      showToast({
        message: "This product is currently out of stock.",
        variant: "info",
      });
      return;
    }

    setFlying(true);

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

    showToast({
      message: "Added to cart!",
      variant: "success",
    });

    window.setTimeout(() => setFlying(false), 650);
  };

  return (
    <div
      className={`group relative border border-zinc-200 bg-white transition-all duration-300 hover:z-10 hover:-translate-y-1 hover:border-black ${
        layout === "scroll"
          ? "min-w-[72vw] snap-start sm:min-w-0"
          : ""
      }`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {product.badge && (
        <span className="absolute left-3 top-3 z-10 border border-black bg-black px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
          {product.badge}
        </span>
      )}
      {outOfStock ? (
        <span className="absolute left-3 top-12 z-10 border border-red-700 bg-red-700 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
          Out of Stock
        </span>
      ) : lowStock ? (
        <span className="absolute left-3 top-12 z-10 border border-amber-700 bg-amber-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-800">
          Low Stock
        </span>
      ) : null}

      <button
        type="button"
        aria-label={
          hasWish
            ? "Remove from wishlist"
            : "Add to wishlist"
        }
        className={`absolute right-3 top-3 z-10 rounded-full bg-white p-2 shadow-sm transition-opacity md:${
          hover || hasWish
            ? "opacity-100"
            : "opacity-0"
        }`}
        onClick={() => {
          toggleWishlist(product.id);

          showToast({
            message: hasWish
              ? "Removed from wishlist"
              : "Saved to wishlist",
            variant: hasWish ? "success" : "info",
          });
        }}
      >
        <Star
          className={`h-4 w-4 ${
            hasWish
              ? "fill-[var(--brand-star)] text-[var(--brand-star)]"
              : "text-zinc-700"
          }`}
        />
      </button>

      <Link href={`/shop/${product.slug}`} className="block">
        <div className="relative aspect-square bg-[#fafafa] p-6">
          <SafeImage
            src={hover ? product.imageHover : product.image}
            alt={product.name}
            label={product.name}
            fill
            sizes="(max-width:768px) 72vw, 25vw"
            className="object-contain transition-opacity duration-300"
          />

          {flying && (
            <motion.span
              layoutId={`fly-${product.id}`}
              className="fly-item pointer-events-none absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/80"
              style={
                {
                  "--fly-x": "140px",
                  "--fly-y": "-120px",
                } as React.CSSProperties
              }
            />
          )}
        </div>
      </Link>

      <div className="space-y-3 px-5 pb-5 pt-4">
        <Link href={`/shop/${product.slug}`}>
          <h3 className="font-display line-clamp-2 text-[20px] font-normal leading-[1.2] text-zinc-900 hover:underline">
            {product.name}
          </h3>
        </Link>

        <p className="text-[12px] text-zinc-500 leading-relaxed">
          {product.concern}
        </p>

        <div className="flex items-baseline gap-2">
          <span className="text-[18px] font-semibold text-black">
            {formatINR(product.price)}
          </span>

          <span className="text-[13px] text-zinc-400 line-through">
            {formatINR(product.mrp)}
          </span>
        </div>

        <button
          type="button"
          onClick={onAdd}
          disabled={outOfStock}
          className="flex h-[44px] w-full items-center justify-center border border-black bg-black text-[12px] font-semibold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:border-zinc-300 disabled:bg-zinc-300 disabled:text-zinc-600"
        >
          {outOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
