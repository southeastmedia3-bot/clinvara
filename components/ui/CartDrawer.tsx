"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { cartTotal, cartCount } from "@/lib/store/cartStore";
import { formatINR } from "@/lib/utils";

const FREE_SHIPPING = 999;

export function CartDrawer() {
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const panelRef = useRef<HTMLDivElement>(null);
  const firstFocusable = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeCart]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.setTimeout(() => firstFocusable.current?.focus(), 50);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const subtotal = cartTotal(items);
  const count = cartCount(items);
  const remaining = Math.max(0, FREE_SHIPPING - subtotal);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150]">
          <motion.button
            type="button"
            aria-label="Close cart overlay"
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => closeCart()}
          />
          <motion.aside
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.28 }}
            className="absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--brand-border)] px-4 py-4">
              <h2 id="cart-drawer-title" className="text-lg font-semibold">
                Your Cart ({count} {count === 1 ? "item" : "items"})
              </h2>
              <button
                ref={firstFocusable}
                type="button"
                aria-label="Close cart"
                onClick={() => closeCart()}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              {items.length === 0 ? (
                <p className="text-sm text-[var(--brand-text-muted)]">
                  Your cart is empty. Explore the shop to build your routine.
                </p>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li
                      key={`${item.productId}-${item.size}`}
                      className="flex gap-3 border-b border-[var(--brand-border)] pb-4"
                    >
                      <div className="relative h-[60px] w-[60px] shrink-0 overflow-hidden bg-[var(--brand-off-white)]">
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          className="object-contain p-1"
                          sizes="60px"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/shop/${item.slug}`}
                          className="line-clamp-2 text-sm font-medium hover:underline"
                          onClick={() => closeCart()}
                        >
                          {item.name}
                        </Link>
                        <p className="text-xs text-[var(--brand-mid-gray)]">
                          {item.size}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            className="h-8 w-8 border border-[var(--brand-border)] text-lg leading-none"
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.size,
                                item.quantity - 1,
                              )
                            }
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            className="h-8 w-8 border border-[var(--brand-border)] text-lg leading-none"
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.size,
                                item.quantity + 1,
                              )
                            }
                          >
                            +
                          </button>
                          <button
                            type="button"
                            aria-label="Remove item"
                            className="ml-auto text-lg text-[var(--brand-mid-gray)] hover:text-black"
                            onClick={() =>
                              removeItem(item.productId, item.size)
                            }
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      <div className="text-right text-sm font-semibold">
                        {formatINR(item.price * item.quantity)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-[var(--brand-border)] px-4 py-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span>Subtotal</span>
                <span className="font-semibold">{formatINR(subtotal)}</span>
              </div>
              {subtotal >= FREE_SHIPPING ? (
                <p className="mb-3 text-xs font-medium text-[var(--brand-green-check)]">
                  You qualify for free shipping.
                </p>
              ) : (
                <p className="mb-3 text-xs text-[var(--brand-text-muted)]">
                  Add {formatINR(remaining)} more for free shipping.
                </p>
              )}
              <Link
                href="/cart"
                className="mb-3 flex h-12 w-full items-center justify-center bg-[var(--brand-primary)] text-sm font-semibold text-white hover:bg-white hover:text-[var(--brand-primary)] hover:ring-1 hover:ring-[var(--brand-primary)]"
                onClick={() => closeCart()}
              >
                Proceed to Checkout
              </Link>
              <button
                type="button"
                className="w-full text-center text-sm underline"
                onClick={() => closeCart()}
              >
                Continue Shopping
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
