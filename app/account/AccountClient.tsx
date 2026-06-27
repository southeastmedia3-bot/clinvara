"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "firebase/auth";
import {
  Heart,
  LogOut,
  MapPin,
  Package,
  Pencil,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { firebaseAuth } from "@/lib/firebase/client";
import {
  readCustomerProfile,
  saveCustomerAddresses,
  saveCustomerCheckoutEmail,
  type CustomerAddress,
} from "@/lib/firebase/customerData";
import { listCustomerOrders } from "@/lib/firebase/customerOrders";
import { useAuthStore } from "@/lib/store/authStore";
import { useWishlistStore } from "@/lib/store/wishlistStore";

type Address = CustomerAddress;

const emptyAddress: Address = {
  id: "",
  label: "Home",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
};

function addressSummary(address: Address) {
  return [address.line1, address.line2, address.city, address.state, address.pincode]
    .filter(Boolean)
    .join(", ");
}

export default function AccountClient() {
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const setLoginOpen = useAuthStore((s) => s.setLoginModalOpen);
  const setRegisterOpen = useAuthStore((s) => s.setRegisterModalOpen);
  const wishIds = useWishlistStore((s) => s.productIds);
  const userUid = user?.uid;
  const userEmail = user?.email;
  const userFirstName = user?.firstName;
  const userLastName = user?.lastName;
  const userName = user?.name;
  const userPhone = user?.phone;
  const userPincode = user?.pincode;
  const userProvider = user?.provider;

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editing, setEditing] = useState<Address | null>(null);
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("authError")) {
      setLoginOpen(true);
    }

    if (params.get("login") === "success") {
      window.history.replaceState(null, "", "/account");
    }

    setCheckingSession(false);
  }, [setLoginOpen]);

  useEffect(() => {
    let active = true;

    if (!userUid) {
      setCheckoutEmail("");
      setAddresses([]);
      setOrderCount(0);
      return;
    }

    void readCustomerProfile(userUid).then((profile) => {
      if (!active || !profile) return;

      setAddresses(profile.addresses ?? []);
      setCheckoutEmail(profile.checkoutEmail ?? profile.email ?? "");

      setAuthenticated(true, {
        uid: userUid,
        name:
          userName ||
          profile.name ||
          userEmail?.split("@")[0] ||
          userPhone ||
          "CLINVARA member",
        email: userEmail || profile.email || undefined,
        phone: userPhone || profile.phone || undefined,
        provider: userProvider || profile.provider || "email",
        firstName: profile.firstName || userFirstName,
        lastName: profile.lastName || userLastName,
        pincode: profile.pincode || userPincode,
      });
    });

    void listCustomerOrders({ uid: userUid, email: userEmail }).then((orders) => {
      if (active) setOrderCount(orders.length);
    });

    return () => {
      active = false;
    };
  }, [
    setAuthenticated,
    userEmail,
    userFirstName,
    userLastName,
    userName,
    userPhone,
    userPincode,
    userProvider,
    userUid,
  ]);

  const displayName =
    user?.name ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email?.split("@")[0] ||
    user?.phone ||
    "CLINVARA member";

  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const saveAddress = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;

    const next = editing.id ? editing : { ...editing, id: crypto.randomUUID() };
    const nextAddresses = [...addresses.filter((address) => address.id !== next.id), next].slice(
      0,
      2,
    );

    setAddresses(nextAddresses);
    setEditing(null);
    if (user?.uid) {
      void saveCustomerAddresses(user.uid, nextAddresses);
    }
  };

  const removeAddress = (addressId: string) => {
    const nextAddresses = addresses.filter((address) => address.id !== addressId);
    setAddresses(nextAddresses);
    if (user?.uid) {
      void saveCustomerAddresses(user.uid, nextAddresses);
    }
  };

  const saveContactDetails = () => {
    if (!user?.uid || user.email) return;
    void saveCustomerCheckoutEmail(user.uid, checkoutEmail);
  };

  const logout = async () => {
    try {
      await signOut(firebaseAuth);
    } finally {
      setAuthenticated(false);
      setAddresses([]);
      setOrderCount(0);
      setCheckoutEmail("");
      window.location.href = "/";
    }
  };

  if (checkingSession) {
    return (
      <div className="mx-auto max-w-[1180px] px-4 py-12 lg:px-8">
        <div className="rounded-2xl border border-[var(--brand-border)] bg-white p-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-text-muted)]">
            CLINVARA Account
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold">Completing sign in...</h1>
          <p className="mt-2 text-sm text-[var(--brand-text-muted)]">
            We are verifying your secure session.
          </p>
        </div>
      </div>
    );
  }

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
              View orders, save formulas, manage profile details, and keep your routine close
              across devices.
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
                ["Order history", "Track orders, invoices, and returns from one place."],
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
    <main className="mx-auto max-w-[1440px] px-4 py-10 lg:px-8">
      <section className="rounded-2xl bg-[var(--brand-off-white)] p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex items-center gap-5">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-black font-semibold text-white">
              {initials}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-text-muted)]">
                Account Dashboard
              </p>
              <h1 className="mt-2 font-display text-4xl font-semibold">Welcome, {displayName}</h1>
              <p className="mt-1 text-sm text-[var(--brand-text-muted)]">
                {user?.email || user?.phone || "Profile details can be updated at checkout."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/account/orders"
              className="inline-flex h-11 items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white"
            >
              View Orders
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-black px-5 text-sm font-semibold"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { icon: UserRound, label: "Login Method", value: user?.provider || "email" },
          { icon: Package, label: "Orders", value: `${orderCount} Orders`, href: "/account/orders" },
          { icon: Heart, label: "Wishlist", value: `${wishIds.length} Items`, href: "/wishlist" },
          { icon: MapPin, label: "Saved Addresses", value: `${addresses.length} of 2` },
        ].map((item) => {
          const Icon = item.icon;
          const body = (
            <article className="h-full rounded-2xl border border-[var(--brand-border)] bg-white p-5 transition hover:border-black">
              <Icon className="h-5 w-5" />
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-text-muted)]">
                {item.label}
              </p>
              <p className="mt-2 text-sm font-semibold capitalize">{item.value}</p>
            </article>
          );
          return item.href ? (
            <Link key={item.label} href={item.href}>
              {body}
            </Link>
          ) : (
            <div key={item.label}>{body}</div>
          );
        })}
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-[0.64fr_0.36fr]">
        <article className="rounded-2xl border border-[var(--brand-border)] bg-white p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-3xl font-semibold">Shipping Addresses</h2>
              <p className="mt-1 text-sm text-[var(--brand-text-muted)]">
                Save up to two addresses for faster checkout.
              </p>
            </div>
            <button
              type="button"
              disabled={addresses.length >= 2}
              onClick={() => setEditing(emptyAddress)}
              className="h-11 rounded-full border border-black px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add Address
            </button>
          </div>

          <div className="mt-5 grid auto-rows-min gap-4 md:grid-cols-2">
            {addresses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--brand-border)] p-5 text-sm text-[var(--brand-text-muted)] md:col-span-2">
                No saved addresses yet. Add a home or work address to speed up checkout.
              </div>
            ) : (
              addresses.map((address) => (
                <div key={address.id} className="rounded-xl border border-[var(--brand-border)] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-text-muted)]">
                        {address.label}
                      </p>
                      <p className="mt-2 font-semibold">{address.fullName}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        aria-label="Edit address"
                        onClick={() => setEditing(address)}
                        className="rounded-full p-2 hover:bg-[var(--brand-off-white)]"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Remove address"
                        onClick={() => removeAddress(address.id)}
                        className="rounded-full p-2 hover:bg-[var(--brand-off-white)]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-[var(--brand-text-muted)]">
                    {addressSummary(address)}
                  </p>
                  <p className="mt-2 text-sm text-[var(--brand-text-muted)]">{address.phone}</p>
                </div>
              ))
            )}
          </div>

          {editing && (
            <form
              onSubmit={saveAddress}
              className="mt-6 grid gap-4 rounded-xl bg-[var(--brand-off-white)] p-5 sm:grid-cols-2"
            >
              {[
                ["label", "Label", "Home"],
                ["fullName", "Full Name", "Ananya Sharma"],
                ["phone", "Mobile Number", "9876543210"],
                ["line1", "Address Line 1", "House / flat / building"],
                ["line2", "Address Line 2", "Area / landmark"],
                ["city", "City", "Mumbai"],
                ["state", "State", "Maharashtra"],
                ["pincode", "PIN Code", "400001"],
              ].map(([key, label, placeholder]) => (
                <label key={key} className="block text-sm font-medium">
                  <span className="mb-2 block text-[var(--brand-text-muted)]">{label}</span>
                  <input
                    required={key !== "line2"}
                    value={String(editing[key as keyof Address])}
                    placeholder={placeholder}
                    onChange={(event) => setEditing({ ...editing, [key]: event.target.value })}
                    className="h-11 w-full rounded-full border border-[var(--brand-border)] bg-white px-4 text-sm outline-none focus:border-black"
                  />
                </label>
              ))}

              <div className="flex gap-3 sm:col-span-2">
                <button
                  type="submit"
                  className="h-11 rounded-full bg-black px-6 text-sm font-semibold text-white"
                >
                  Save Address
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="h-11 rounded-full border border-black px-6 text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </article>

        <div className="space-y-8">
          <article className="rounded-2xl border border-[var(--brand-border)] bg-white p-6">
            <UserRound className="h-5 w-5" />
            <h2 className="mt-5 font-display text-3xl font-semibold">Contact Details</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--brand-text-muted)]">
              Email and a complete shipping address are required only when you proceed to checkout.
            </p>

            <label className="mt-5 block text-sm font-medium">
              <span className="mb-2 block text-[var(--brand-text-muted)]">Checkout Email</span>
              <input
                type="email"
                value={user?.email || checkoutEmail}
                disabled={Boolean(user?.email)}
                onChange={(event) => setCheckoutEmail(event.target.value)}
                placeholder="Enter your email address"
                className="h-11 w-full rounded-full border border-[var(--brand-border)] bg-white px-4 text-sm outline-none focus:border-black disabled:bg-[var(--brand-off-white)]"
              />
            </label>
            {!user?.email && (
              <button
                type="button"
                onClick={saveContactDetails}
                className="mt-4 h-11 rounded-full bg-black px-5 text-sm font-semibold text-white"
              >
                Save Contact
              </button>
            )}
          </article>

          <article className="rounded-2xl border border-[var(--brand-border)] bg-white p-6">
            <ShieldCheck className="h-5 w-5" />
            <h2 className="mt-5 font-display text-3xl font-semibold">Orders</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--brand-text-muted)]">
              Review order history, tracking, invoices, and returns from the dedicated orders page.
            </p>
            <Link
              href="/account/orders"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white"
            >
              View Orders
            </Link>
          </article>
        </div>
      </section>

      <section
        id="wishlist"
        className="mt-10 scroll-mt-24 rounded-2xl border border-[var(--brand-border)] bg-white p-6"
      >
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-3xl font-semibold">Wishlist</h2>
            <p className="mt-1 text-sm text-[var(--brand-text-muted)]">
              Wishlist: {wishIds.length} {wishIds.length === 1 ? "Item" : "Items"}
            </p>
          </div>
          <Link
            href="/wishlist"
            className="inline-flex h-11 items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white"
          >
            View Wishlist
          </Link>
        </div>
      </section>
    </main>
  );
}
