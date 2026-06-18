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
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setResult(true);
  };

  return (
    <div className="mx-auto max-w-[560px] px-4 py-12">
      <h1 className="text-center font-display text-4xl font-semibold">
        Track Your Order
      </h1>
      <p className="mt-2 text-center text-sm text-[var(--brand-text-muted)]">
        Enter your order details to see real-time delivery status.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <label className="block text-sm font-medium">
          Order ID
          <input
            className="mt-1 w-full border border-[var(--brand-border)] px-3 py-3 text-sm outline-none focus:border-black"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="CLV-102938"
          />
          {errors.orderId && (
            <span className="text-xs text-red-600">{errors.orderId}</span>
          )}
        </label>
        <label className="block text-sm font-medium">
          Email or Phone
          <input
            className="mt-1 w-full border border-[var(--brand-border)] px-3 py-3 text-sm outline-none focus:border-black"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Email address or +91..."
          />
          {errors.contact && (
            <span className="text-xs text-red-600">{errors.contact}</span>
          )}
        </label>
        <button
          type="submit"
          disabled={loading}
          className="h-12 w-full bg-[var(--brand-primary)] text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Tracking…" : "Track Order"}
        </button>
      </form>

      {result && (
        <div className="mt-10 border border-[var(--brand-border)] p-6">
          <p className="mb-6 text-sm font-semibold">Order {orderId || "CLV-102938"}</p>
          <ul className="space-y-6">
            {steps.map((step) => (
              <li key={step.label} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                      step.done
                        ? "border-[var(--brand-green-check)] bg-[var(--brand-green-check)] text-white"
                        : "border-[var(--brand-border)] bg-white"
                    }`}
                  >
                    {step.done ? <Check className="h-4 w-4" /> : ""}
                  </span>
                  <span className="mt-1 h-full w-px bg-[var(--brand-border)]" />
                </div>
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      step.active ? "text-black" : ""
                    }`}
                  >
                    {step.active && "🔄 "}
                    {!step.done && !step.active && "⬜ "}
                    {step.done && !step.active && "✅ "}
                    {step.label}
                  </p>
                  {step.date && (
                    <p className="text-xs text-[var(--brand-mid-gray)]">
                      {step.date}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
