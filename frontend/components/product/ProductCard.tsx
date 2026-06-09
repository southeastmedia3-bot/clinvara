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

  const onAdd = () => {
    setFlying(true);
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      size,
      price: product.price,
      quantity: 1,
    });
    showToast({ message: "Added to cart!", variant: "success" });
    window.setTimeout(() => setFlying(false), 650);
  };

  return (
    <div
      className={`group relative border border-[var(--brand-border)] bg-white transition-transform hover:z-10 hover:scale-[1.01] hover:border-[var(--brand-primary)] ${
        layout === "scroll" ? "min-w-[72vw] snap-start sm:min-w-0" : ""
      }`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {product.badge && (
        <span className="absolute left-2 top-2 z-10 bg-[var(--brand-accent)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white">
          {product.badge}
        </span>
      )}
      <button
        type="button"
        aria-label={hasWish ? "Remove from wishlist" : "Add to wishlist"}
        className={`absolute right-2 top-2 z-10 rounded-full bg-white/90 p-1 shadow transition-opacity ${
          hover || hasWish ? "opacity-100" : "opacity-0"
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
          className={`h-5 w-5 ${
            hasWish ? "fill-[var(--brand-star)] text-[var(--brand-star)]" : ""
          }`}
        />
      </button>

      <Link href={`/shop/${product.slug}`} className="block">
        <div className="relative aspect-square bg-white p-3">
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

      <div className="space-y-2 px-3 pb-4 pt-2">
        <Link href={`/shop/${product.slug}`}>
          <h3 className="font-display line-clamp-2 text-[20px] font-normal leading-[1.2]">
            {product.name}
          </h3>
        </Link>
        <p className="text-[12px] leading-[1.6] text-[var(--brand-mid-gray)]">{product.concern}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold">{formatINR(product.price)}</span>
          <span className="text-sm text-[var(--brand-mid-gray)] line-through">
            {formatINR(product.mrp)}
          </span>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="flex h-[42px] w-full items-center justify-center bg-[var(--brand-primary)] text-sm font-semibold text-white transition-colors hover:bg-white hover:text-[var(--brand-primary)] hover:ring-1 hover:ring-[var(--brand-primary)]"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
