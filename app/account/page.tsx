"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Heart, MapPin, Package, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { useCartStore } from "@/lib/store/cartStore";
import { allProducts } from "@/lib/data/products";
import { ProductCard } from "@/components/product/ProductCard";

export default function AccountPage() {
  const searchParams = useSearchParams();
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const setLoginOpen = useAuthStore((s) => s.setLoginModalOpen);
  const setRegisterOpen = useAuthStore((s) => s.setRegisterModalOpen);
  const wishIds = useWishlistStore((s) => s.productIds);
  const cartItems = useCartStore((s) => s.items);
  const [hash, setHash] = useState("");

  useEffect(() => {
    setHash(window.location.hash);
    const onHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    if (searchParams.get("authError")) setLoginOpen(true);
  }, [searchParams, setLoginOpen]);

  const wishlistProducts = allProducts.filter((p) => wishIds.includes(p.id));
  const displayName = user?.firstName || user?.email?.split("@")[0] || "CLINVARA member";

  if (!isAuth) {
    return (
      <div className="mx-auto max-w-[1180px] px-4 py-12 lg:px-8">
        <div className="grid overflow-hidden rounded-2xl border border-[var(--brand-border)] bg-white shadow-sm lg:grid-cols-[1fr_0.9fr]">
          <section className="p-8 sm:p-10 lg:p-14">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-text-muted)]">
              CLINVARA Account
            </p>
            <h1 className="mt-4 font-display text-5xl font-semibold leading-tight">
              Sign in for a more personal skincare ritual.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--brand-text-muted)]">
              View orders, save formulas, manage profile details, and keep your routine close across devices.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="h-12 rounded-full bg-black px-8 text-sm font-semibold text-white"
                onClick={() => setLoginOpen(true)}
              >
                Sign In
              </button>
              <button
                type="button"
                className="h-12 rounded-full border border-black px-8 text-sm font-semibold"
                onClick={() => setRegisterOpen(true)}
              >
                Create Account
              </button>
            </div>
          </section>
          <aside className="bg-[var(--brand-off-white)] p-8 sm:p-10 lg:p-14">
            <div className="space-y-5">
              {[
                ["Faster checkout", "Save details for a quieter purchase flow."],
                ["Wishlist access", "Return to products you are considering."],
                ["Routine notes", "Keep your preferred formulas easy to find."],
              ].map(([title, body]) => (
                <div key={title} className="rounded-xl bg-white p-5">
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1 text-sm text-[var(--brand-text-muted)]">{body}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-10 lg:px-8">
      <section className="rounded-2xl bg-[var(--brand-off-white)] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-text-muted)]">
          Account Dashboard
        </p>
        <div className="mt-3 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <h1 className="font-display text-5xl font-semibold">Welcome, {displayName}</h1>
            <p className="mt-3 max-w-2xl text-sm text-[var(--brand-text-muted)]">
              Manage your CLINVARA profile, wishlist, orders, and skincare preferences.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex h-12 items-center justify-center rounded-full bg-black px-8 text-sm font-semibold text-white"
          >
            Continue Shopping
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { icon: UserRound, label: "Profile", value: user?.email || "Email not added" },
          { icon: Package, label: "Orders", value: "No orders yet" },
          { icon: Heart, label: "Wishlist", value: `${wishlistProducts.length} saved products` },
          { icon: MapPin, label: "Country", value: "India" },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-[var(--brand-border)] bg-white p-5">
            <item.icon className="h-5 w-5" />
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-text-muted)]">
              {item.label}
            </p>
            <p className="mt-2 text-sm font-semibold">{item.value}</p>
          </div>
        ))}
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[0.72fr_0.28fr]">
        <section className="rounded-2xl border border-[var(--brand-border)] bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-semibold">Recent Orders</h2>
              <p className="mt-1 text-sm text-[var(--brand-text-muted)]">
                Orders will appear here after checkout is connected.
              </p>
            </div>
            <Link href="/track-order" className="text-sm font-semibold underline">
              Track Order
            </Link>
          </div>
          <div className="mt-6 rounded-xl border border-dashed border-[var(--brand-border)] p-8 text-center">
            <ShieldCheck className="mx-auto h-8 w-8 text-[var(--brand-text-muted)]" />
            <p className="mt-3 font-semibold">No purchases yet</p>
            <p className="mt-1 text-sm text-[var(--brand-text-muted)]">
              Your order history and invoice details will be available here.
            </p>
          </div>
        </section>

        <aside className="rounded-2xl border border-[var(--brand-border)] bg-white p-6">
          <Sparkles className="h-5 w-5" />
          <h2 className="mt-5 font-display text-2xl font-semibold">Routine Snapshot</h2>
          <p className="mt-2 text-sm text-[var(--brand-text-muted)]">
            {cartItems.length > 0
              ? `${cartItems.length} item type is currently in your cart.`
              : "Build a routine by saving or adding products to your cart."}
          </p>
          <Link href="/routines" className="mt-5 inline-flex text-sm font-semibold underline">
            View Routines
          </Link>
        </aside>
      </div>

      <section
        id="wishlist"
        className={`mt-10 rounded-2xl border border-[var(--brand-border)] bg-white p-6 ${
          hash === "#wishlist" ? "scroll-mt-24" : ""
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-semibold">Wishlist</h2>
            <p className="mt-1 text-sm text-[var(--brand-text-muted)]">
              Your saved formulas for later review.
            </p>
          </div>
          <Link href="/shop" className="text-sm font-semibold underline">
            Browse Shop
          </Link>
        </div>
        {wishlistProducts.length === 0 ? (
          <p className="mt-6 rounded-xl bg-[var(--brand-off-white)] p-5 text-sm text-[var(--brand-text-muted)]">
            No saved products yet.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {wishlistProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
