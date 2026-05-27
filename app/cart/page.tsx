"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore, cartTotal } from "@/lib/store/cartStore";
import { useAuthStore } from "@/lib/store/authStore";
import { useToast } from "@/components/providers/ToastProvider";
import { formatINR } from "@/lib/utils";
import { readCustomerProfile } from "@/lib/firebase/customerData";
import { createOrder } from "@/lib/firebase/orders";

type CheckoutAddress = {
  fullName?: string;
  phone?: string;
  line1?: string;
  line2?: string;
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
  const [checkoutLoading, setCheckoutLoading] = useState(false);

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
                    alt={item.name}
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
                      aria-label={`Decrease quantity for ${item.name}`}
                      className="h-11 w-11 border"
                      onClick={() =>
                        updateQuantity(item.productId, item.size, item.quantity - 1)
                      }
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      type="button"
                      aria-label={`Increase quantity for ${item.name}`}
                      className="h-11 w-11 border"
                      onClick={() =>
                        updateQuantity(item.productId, item.size, item.quantity + 1)
                      }
                    >
                      +
                    </button>

                    <button
                      type="button"
                      className="ml-auto text-sm underline"
                      onClick={() => removeItem(item.productId, item.size)}
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
            disabled={checkoutLoading}
            className="mt-6 h-12 w-full bg-black text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            onClick={async () => {
              if (checkoutLoading) return;

              if (!isAuthenticated || !user?.uid) {
                setLoginOpen(true);
                showToast({
                  message: "Please sign in before checkout.",
                  variant: "info",
                });
                return;
              }

              setCheckoutLoading(true);

              try {
                const customer = await readCustomerProfile(user.uid);

                const checkoutEmail =
                  user.email || customer?.checkoutEmail || customer?.email || "";

                const savedAddresses = (customer?.addresses ?? []) as CheckoutAddress[];

                const shippingAddress = savedAddresses.find(hasCompleteAddress);

                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(checkoutEmail)) {
                  showToast({
                    message: "Add a valid checkout email in your account before payment.",
                    variant: "error",
                    durationMs: 5000,
                  });
                  window.location.href = "/account?checkout=details";
                  return;
                }

                if (!shippingAddress) {
                  showToast({
                    message: "Add a complete shipping address in your account before payment.",
                    variant: "error",
                    durationMs: 5000,
                  });
                  window.location.href = "/account?checkout=details";
                  return;
                }

                const orderId = await createOrder({
                  userId: user.uid,
                  email: checkoutEmail,
                  items,
                  subtotal,
                  shippingAddress: {
                    fullName: shippingAddress.fullName ?? "",
                    phone: shippingAddress.phone ?? "",
                    line1: shippingAddress.line1 ?? "",
                    line2: shippingAddress.line2 ?? "",
                    city: shippingAddress.city ?? "",
                    state: shippingAddress.state ?? "",
                    pincode: shippingAddress.pincode ?? "",
                  },
                });

                showToast({
                  message: `Pending order created. Order ID: ${orderId}`,
                  variant: "success",
                  durationMs: 7000,
                });
              } catch (error) {
                console.error("Checkout error:", error);
                showToast({
                  message: "Unable to create order. Please try again.",
                  variant: "error",
                });
              } finally {
                setCheckoutLoading(false);
              }
            }}
          >
            {checkoutLoading ? "Creating Order..." : "Proceed to Checkout"}
          </button>
        </>
      )}
    </div>
  );
}
