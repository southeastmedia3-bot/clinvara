"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore, cartTotal } from "@/lib/store/cartStore";
import { useAuthStore } from "@/lib/store/authStore";
import { useToast } from "@/components/providers/ToastProvider";
import { formatINR } from "@/lib/utils";
import { readCheckoutEmail } from "@/lib/customerProfile";

type CheckoutAddress = {
  fullName?: string;
  phone?: string;
  line1?: string;
  city?: string;
  state?: string;
  pincode?: string;
};

function hasCompleteAddress(address: CheckoutAddress) {
  return Boolean(
    address.fullName?.trim() &&
      address.phone?.trim() &&
      address.line1?.trim() &&
      address.city?.trim() &&
      address.state?.trim() &&
      address.pincode &&
      /^\d{6}$/.test(address.pincode),
  );
}

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const setLoginOpen = useAuthStore((s) => s.setLoginModalOpen);
  const { showToast } = useToast();
  const subtotal = cartTotal(items);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
      <h1 className="font-display text-4xl font-semibold">Your Cart</h1>
      {items.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--brand-text-muted)]">
          Your cart is empty.{" "}
          <Link href="/shop" className="font-semibold underline">
            Continue shopping
          </Link>
        </p>
      ) : (
        <>
          <ul className="mt-8 space-y-4">
            {items.map((item) => (
              <li
                key={`${item.productId}-${item.size}`}
                className="flex gap-4 border-b border-[var(--brand-border)] pb-4"
              >
                <div className="relative h-20 w-20 shrink-0 bg-[var(--brand-off-white)]">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    className="object-contain p-1"
                    sizes="80px"
                  />
                </div>
                <div className="flex-1">
                  <Link
                    href={`/shop/${item.slug}`}
                    className="font-medium hover:underline"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-[var(--brand-mid-gray)]">
                    {item.size}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      className="h-8 w-8 border"
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
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      className="h-8 w-8 border"
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
                      className="ml-auto text-sm underline"
                      onClick={() =>
                        removeItem(item.productId, item.size)
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <p className="font-semibold">
                  {formatINR(item.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex items-center justify-between border-t border-[var(--brand-border)] pt-6">
            <span className="font-semibold">Subtotal</span>
            <span className="text-lg font-bold">{formatINR(subtotal)}</span>
          </div>
          <button
            type="button"
            className="mt-6 h-12 w-full bg-black text-sm font-semibold text-white"
            onClick={() => {
              if (!isAuthenticated) {
                setLoginOpen(true);
                showToast({
                  message: "Please sign in before checkout.",
                  variant: "info",
                });
                return;
              }
              const checkoutEmail = readCheckoutEmail(user);
              const savedAddresses = JSON.parse(
                window.localStorage.getItem("clinvara-addresses") || "[]",
              ) as CheckoutAddress[];
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(checkoutEmail)) {
                showToast({
                  message: "Add a valid checkout email in your account before payment.",
                  variant: "error",
                  durationMs: 5000,
                });
                window.location.href = "/account?checkout=details";
                return;
              }
              if (!savedAddresses.some(hasCompleteAddress)) {
                showToast({
                  message: "Add a complete shipping address in your account before payment.",
                  variant: "error",
                  durationMs: 5000,
                });
                window.location.href = "/account?checkout=details";
                return;
              }
              alert("Payment will be enabled after Razorpay is connected.");
            }}
          >
            Proceed to Checkout
          </button>
        </>
      )}
    </div>
  );
}
