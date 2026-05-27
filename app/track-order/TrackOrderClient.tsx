"use client";

import { useState } from "react";
import { SearchX } from "lucide-react";

export function TrackOrderClient() {
  const [orderId, setOrderId] = useState("");
  const [contact, setContact] = useState("");
  const [errors, setErrors] = useState<{ orderId?: string; contact?: string }>({});
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!orderId.trim()) next.orderId = "Order ID is required.";
    if (!contact.trim()) next.contact = "Email or phone is required.";
    setErrors(next);
    setSearched(false);
    if (Object.keys(next).length) return;
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setLoading(false);
    setSearched(true);
  };

  return (
    <main className="mx-auto max-w-[640px] px-4 py-12">
      <section className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-text-muted)]">
          Orders
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold">
          Track Your Order
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--brand-text-muted)]">
          Enter your order details to check whether tracking is available. For privacy,
          detailed shipping information is shown only inside a signed-in account.
        </p>
      </section>

      <form
        onSubmit={submit}
        className="mt-8 rounded-2xl border border-[var(--brand-border)] bg-white p-5 shadow-sm"
      >
        <div className="space-y-4">
          <label className="block text-sm font-medium">
            Order ID
            <input
              className="mt-1 w-full rounded-xl border border-[var(--brand-border)] px-3 py-3 text-sm outline-none transition focus:border-black"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="CLV-102938"
              aria-invalid={Boolean(errors.orderId)}
            />
            {errors.orderId && (
              <span className="mt-1 block text-xs text-red-600">
                {errors.orderId}
              </span>
            )}
          </label>
          <label className="block text-sm font-medium">
            Email or Phone
            <input
              className="mt-1 w-full rounded-xl border border-[var(--brand-border)] px-3 py-3 text-sm outline-none transition focus:border-black"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="you@email.com or +91..."
              aria-invalid={Boolean(errors.contact)}
            />
            {errors.contact && (
              <span className="mt-1 block text-xs text-red-600">
                {errors.contact}
              </span>
            )}
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-5 h-12 w-full rounded-full bg-[var(--brand-primary)] text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Tracking..." : "Track Order"}
        </button>
      </form>

      {searched && (
        <section className="mt-8 rounded-2xl border border-[var(--brand-border)] bg-white p-6 text-center shadow-sm">
          <SearchX className="mx-auto h-8 w-8 text-[var(--brand-text-muted)]" />
          <h2 className="mt-3 font-display text-2xl font-semibold">
            No order found
          </h2>
          <p className="mt-2 text-sm text-[var(--brand-text-muted)]">
            No order found for those details. Check your order ID and contact
            information, or sign in to view your account orders.
          </p>
        </section>
      )}
    </main>
  );
}
