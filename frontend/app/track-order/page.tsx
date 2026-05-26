"use client";

import { useState } from "react";
import { Check } from "lucide-react";

const steps = [
  { label: "Order Placed", date: "May 10, 2025", done: true },
  { label: "Payment Confirmed", date: "", done: true },
  { label: "Packed & Dispatched", date: "", done: true },
  { label: "Out for Delivery", date: "", done: true, active: true },
  { label: "Delivered", date: "", done: false },
];

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [contact, setContact] = useState("");
  const [errors, setErrors] = useState<{ orderId?: string; contact?: string }>(
    {},
  );
  const [result, setResult] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!orderId.trim()) next.orderId = "Order ID is required.";
    if (!contact.trim()) next.contact = "Email or phone is required.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoading(false);
    setResult(true);
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
          Enter your order details to view the latest fulfilment and delivery
          status. For newly placed orders, tracking may take a few hours to
          update.
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

      {result && (
        <section className="mt-8 rounded-2xl border border-[var(--brand-border)] bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-1 border-b border-[var(--brand-border)] pb-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold">
              Order {orderId || "CLV-102938"}
            </p>
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--brand-text-muted)]">
              In transit
            </p>
          </div>
          <ul className="space-y-6">
            {steps.map((step, index) => (
              <li key={step.label} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                      step.done
                        ? "border-[var(--brand-green-check)] bg-[var(--brand-green-check)] text-white"
                        : "border-[var(--brand-border)] bg-white"
                    }`}
                  >
                    {step.done ? <Check className="h-4 w-4" /> : null}
                  </span>
                  {index < steps.length - 1 && (
                    <span className="mt-1 h-full min-h-8 w-px bg-[var(--brand-border)]" />
                  )}
                </div>
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      step.active ? "text-black" : "text-[var(--brand-primary)]"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="mt-1 text-xs text-[var(--brand-mid-gray)]">
                    {step.active
                      ? "Current status"
                      : step.date || "Update pending"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
