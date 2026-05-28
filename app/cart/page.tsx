"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const [savedAddresses, setSavedAddresses] = useState<CheckoutAddress[]>([]);
  const [checkoutEmailValue, setCheckoutEmailValue] = useState("");
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(null);
  const [addressError, setAddressError] = useState("");
  const [highlightAddress, setHighlightAddress] = useState(false);
  const addressSectionRef = useRef<HTMLDivElement | null>(null);

  const subtotal = cartTotal(items);
  const completeAddresses = useMemo(
    () => savedAddresses.filter(hasCompleteAddress),
    [savedAddresses],
  );
  const selectedShippingAddress =
    selectedAddressIndex === null ? null : completeAddresses[selectedAddressIndex] ?? null;

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
                  <h2 className="font-display text-2xl font-semibold">
                    Delivery Address
                  </h2>
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
                        <span className="block font-semibold">
                          {address.fullName}
                        </span>
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
                  No saved delivery address yet. Add one in your account to
                  continue checkout.
                </div>
              )}
            </section>
          )}

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

                const orderId = await createOrder({
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
