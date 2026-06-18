"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ProductGrid } from "@/components/product/ProductGrid";
import { useCartStore, cartTotal } from "@/lib/store/cartStore";
import { useAuthStore } from "@/lib/store/authStore";
import { useToast } from "@/components/providers/ToastProvider";
import { formatINR } from "@/lib/utils";
import { readCustomerProfile } from "@/lib/firebase/customerData";
import { createOrder } from "@/lib/firebase/orders";
import { getDeliveryEstimate } from "@/lib/delivery/estimate";
import { allProducts } from "@/lib/data/products";

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
  const refreshLatestPrices = useCartStore((s) => s.refreshLatestPrices);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const setLoginOpen = useAuthStore((s) => s.setLoginModalOpen);
  const { showToast } = useToast();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<CheckoutAddress[]>([]);
  const [checkoutEmailValue, setCheckoutEmailValue] = useState("");
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(null);
  const [addressError, setAddressError] = useState("");
  const [highlightAddress, setHighlightAddress] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState("");
  const [createdOrderTotal, setCreatedOrderTotal] = useState(0);
  const addressSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    void refreshLatestPrices();
  }, [refreshLatestPrices]);

  const subtotal = cartTotal(items);
  const freeGiftThreshold = 999;
  const giftRemaining = Math.max(0, freeGiftThreshold - subtotal);
  const giftProgress = Math.min(100, Math.round((subtotal / freeGiftThreshold) * 100));
  const recommendedProducts = useMemo(() => {
    const inCart = new Set(items.map((item) => item.productId));
    return allProducts.filter((product) => !inCart.has(product.id)).slice(0, 4);
  }, [items]);

  const completeAddresses = useMemo(
    () => savedAddresses.filter(hasCompleteAddress),
    [savedAddresses],
  );
  const selectedShippingAddress =
    selectedAddressIndex === null ? null : completeAddresses[selectedAddressIndex] ?? null;
  const checkoutDeliveryEstimate = getDeliveryEstimate({
    dispatchTimeDays: Math.max(1, ...items.map((item) => Number(item.dispatchTimeDays ?? 1))),
    address: selectedShippingAddress,
  });

  useEffect(() => {
    let active = true;

    if (!user?.uid) {
      setSavedAddresses([]);
      setCheckoutEmailValue("");
      setSelectedAddressIndex(null);
      return;
    }

    void readCustomerProfile(user.uid).then((customer) => {
      if (!active) return;
      const addresses = ((customer?.addresses ?? []) as CheckoutAddress[]).filter(
        hasCompleteAddress,
      );
      setSavedAddresses(addresses);
      setCheckoutEmailValue(user.email || customer?.checkoutEmail || customer?.email || "");
      setSelectedAddressIndex(addresses.length === 1 ? 0 : null);
    });

    return () => {
      active = false;
    };
  }, [user?.email, user?.uid]);

  const guideToAddress = (message: string) => {
    setAddressError(message);
    setHighlightAddress(true);
    addressSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    window.setTimeout(() => setHighlightAddress(false), 2500);
    showToast({
      message,
      variant: "error",
      durationMs: 5000,
    });
  };

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-12 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-text-muted)]">
            Checkout
          </p>
          <h1 className="mt-2 font-display text-5xl font-semibold">Your Cart</h1>
        </div>
        <Link
          href="/shop"
          className="inline-flex h-11 items-center justify-center rounded-full border border-black px-5 text-sm font-semibold transition hover:bg-black hover:text-white"
        >
          Continue Shopping
        </Link>
      </div>

      {items.length === 0 ? (
        <section className="mt-8 rounded-3xl border border-dashed border-[var(--brand-border)] bg-white p-10 text-center">
          <h2 className="font-display text-3xl font-semibold">Your cart is empty.</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--brand-text-muted)]">
            Add your CLINVARA routine essentials and return here for checkout.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white"
          >
            Continue Shopping
          </Link>
        </section>
      ) : (
        <>
          <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              <div className="rounded-2xl border border-[var(--brand-border)] bg-white p-5">
                <p className="font-semibold">
                  {giftRemaining > 0
                    ? `Spend ${formatINR(giftRemaining)} more to get Free Sunscreen`
                    : "Free Sunscreen unlocked"}
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--brand-off-white)]">
                  <div className="h-full rounded-full bg-black" style={{ width: `${giftProgress}%` }} />
                </div>
              </div>

              <ul className="space-y-4">
                {items.map((item) => (
                  <li
                    key={`${item.productId}-${item.size}`}
                    className="flex flex-col gap-4 rounded-2xl border border-[var(--brand-border)] bg-white p-4 sm:flex-row"
                  >
                    <div className="relative h-24 w-24 shrink-0 rounded-xl bg-[var(--brand-off-white)]">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-2"
                        sizes="96px"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <Link href={`/shop/${item.slug}`} className="font-semibold hover:underline">
                        {item.name}
                      </Link>
                      <p className="text-xs text-[var(--brand-mid-gray)]">{item.size}</p>
                      <p className="mt-1 text-xs text-[var(--brand-text-muted)]">
                        Estimated delivery:{" "}
                        {getDeliveryEstimate({
                          dispatchTimeDays: item.dispatchTimeDays ?? 1,
                          address: selectedShippingAddress,
                        }).label}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <div className="flex items-center rounded-full border border-[var(--brand-border)]">
                          <button
                            type="button"
                            aria-label={`Decrease quantity for ${item.name}`}
                            className="h-10 w-10"
                            onClick={() =>
                              updateQuantity(item.productId, item.size, item.quantity - 1)
                            }
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                          <button
                            type="button"
                            aria-label={`Increase quantity for ${item.name}`}
                            className="h-10 w-10"
                            onClick={() =>
                              updateQuantity(item.productId, item.size, item.quantity + 1)
                            }
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          className="text-sm font-semibold underline"
                          onClick={() => removeItem(item.productId, item.size)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <p className="font-semibold sm:text-right">
                      {formatINR(item.price * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <aside className="h-fit rounded-3xl border border-[var(--brand-border)] bg-white p-5 shadow-sm lg:sticky lg:top-24">
              <h2 className="font-display text-3xl font-semibold">Order Summary</h2>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between border-b border-[var(--brand-border)] pb-3">
                  <span className="text-[var(--brand-text-muted)]">Subtotal</span>
                  <strong>{formatINR(subtotal)}</strong>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-[var(--brand-border)] pb-3">
                  <span className="text-[var(--brand-text-muted)]">Delivery</span>
                  <strong className="text-right">
                    {checkoutDeliveryEstimate.label}
                    {selectedShippingAddress ? ` (${checkoutDeliveryEstimate.region})` : ""}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total</span>
                  <strong className="text-lg">{formatINR(subtotal)}</strong>
                </div>
              </div>
            </aside>
          </section>

          {isAuthenticated && (
            <section
              ref={addressSectionRef}
              className={`mt-6 rounded-2xl border bg-white p-5 transition ${
                highlightAddress || addressError
                  ? "border-black ring-2 ring-black/10"
                  : "border-[var(--brand-border)]"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-semibold">Delivery Address</h2>
                  <p className="mt-1 text-sm text-[var(--brand-text-muted)]">
                    Select where your CLINVARA order should be delivered.
                  </p>
                </div>
                <Link href="/account" className="shrink-0 text-sm font-semibold underline">
                  Add Address
                </Link>
              </div>

              {addressError && (
                <p className="mt-4 rounded-xl bg-[var(--brand-off-white)] p-3 text-sm font-semibold text-black">
                  {addressError}
                </p>
              )}

              {completeAddresses.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {completeAddresses.map((address, index) => (
                    <label
                      key={`${address.line1}-${address.pincode}-${index}`}
                      className={`flex cursor-pointer gap-3 rounded-xl border p-4 text-sm transition ${
                        selectedAddressIndex === index
                          ? "border-black bg-[var(--brand-off-white)]"
                          : "border-[var(--brand-border)]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery-address"
                        className="mt-1"
                        checked={selectedAddressIndex === index}
                        onChange={() => {
                          setSelectedAddressIndex(index);
                          setAddressError("");
                          setHighlightAddress(false);
                        }}
                      />
                      <span>
                        <span className="block font-semibold">{address.fullName}</span>
                        <span className="mt-1 block text-[var(--brand-text-muted)]">
                          {[address.line1, address.line2, address.city, address.state, address.pincode]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                        <span className="mt-1 block text-[var(--brand-text-muted)]">
                          {address.phone}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-[var(--brand-border)] p-5 text-sm text-[var(--brand-text-muted)]">
                  No saved delivery address yet. Add one in your account to continue checkout.
                </div>
              )}
            </section>
          )}

          <button
            type="button"
            disabled={checkoutLoading}
            className="mt-6 h-12 w-full rounded-full bg-black text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
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
                  user.email || checkoutEmailValue || customer?.checkoutEmail || customer?.email || "";

                const savedAddresses = (customer?.addresses ?? []) as CheckoutAddress[];
                const completeSavedAddresses = savedAddresses.filter(hasCompleteAddress);
                const selectedAddress =
                  selectedShippingAddress ??
                  (completeSavedAddresses.length === 1 ? completeSavedAddresses[0] : null);

                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(checkoutEmail)) {
                  showToast({
                    message: "Add a valid checkout email in your account before payment.",
                    variant: "error",
                    durationMs: 5000,
                  });
                  window.location.href = "/account?checkout=details";
                  return;
                }

                if (!completeSavedAddresses.length) {
                  guideToAddress("Please add a delivery address to continue.");
                  return;
                }

                if (!selectedAddress) {
                  guideToAddress("Please select a delivery address to continue.");
                  return;
                }

                const order = await createOrder({
                  userId: user.uid,
                  email: checkoutEmail,
                  items,
                  subtotal,
                  shippingAddress: {
                    fullName: selectedAddress.fullName ?? "",
                    phone: selectedAddress.phone ?? "",
                    line1: selectedAddress.line1 ?? "",
                    line2: selectedAddress.line2 ?? "",
                    city: selectedAddress.city ?? "",
                    state: selectedAddress.state ?? "",
                    pincode: selectedAddress.pincode ?? "",
                  },
                });

                setCreatedOrderId(order.publicOrderId);
                setCreatedOrderTotal(subtotal);
                showToast({
                  message: "Order placed and waiting for confirmation.",
                  variant: "success",
                  durationMs: 5000,
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

          {createdOrderId && (
            <div className="fixed inset-0 z-[240] flex items-center justify-center bg-black/35 px-4 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-2xl border border-[var(--brand-border)] bg-white p-6 text-center shadow-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-text-muted)]">
                  Order Placed
                </p>
                <h2 className="mt-2 font-display text-3xl font-semibold">
                  Waiting for confirmation
                </h2>
                <p className="mt-3 text-sm leading-6 text-[var(--brand-text-muted)]">
                  Your order has been received and is waiting for admin confirmation. Order ID:{" "}
                  <span className="font-semibold text-black">{createdOrderId}</span>
                </p>
                <p className="mt-2 text-sm text-[var(--brand-text-muted)]">
                  Status: Waiting for confirmation
                </p>
                <p className="mt-1 text-sm text-[var(--brand-text-muted)]">
                  Total: <span className="font-semibold text-black">{formatINR(createdOrderTotal)}</span>
                </p>
                <p className="mt-1 text-sm text-[var(--brand-text-muted)]">
                  Support:{" "}
                  <a href="tel:+917207118111" className="font-semibold text-black underline">
                    +91 72071 18111
                  </a>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard?.writeText(createdOrderId);
                    showToast({ message: "Order ID copied.", variant: "success" });
                  }}
                  className="mt-4 text-sm font-semibold underline"
                >
                  Copy Order ID
                </button>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={`/track-order?orderId=${encodeURIComponent(createdOrderId)}`}
                    className="flex-1 rounded-full bg-black px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white"
                  >
                    Track order
                  </Link>
                  <Link
                    href="/account/orders"
                    className="flex-1 rounded-full border border-black px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em]"
                  >
                    View my orders
                  </Link>
                  <Link
                    href="/shop"
                    className="flex-1 rounded-full border border-black px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em]"
                  >
                    Continue shopping
                  </Link>
                </div>
              </div>
            </div>
          )}

          {recommendedProducts.length > 0 && (
            <section className="mt-14 border-t border-[var(--brand-border)] pt-10">
              <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-text-muted)]">
                    Complete Your Routine
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-semibold">
                    Recommended Products
                  </h2>
                </div>
                <Link href="/shop" className="text-sm font-semibold underline">
                  View all products
                </Link>
              </div>
              <ProductGrid products={recommendedProducts} mobileColumns={2} />
            </section>
          )}
        </>
      )}
    </div>
  );
}
