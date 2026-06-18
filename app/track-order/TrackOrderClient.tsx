"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, PackageCheck, SearchX, Truck } from "lucide-react";
import { apiUrl } from "@/lib/api/client";
import {
  normalizeOrderStatus,
  type OrderStatusKey,
  orderStatusIndex,
  orderTimelineSteps,
} from "@/lib/orders/status";

type TrackedOrder = {
  id: string;
  orderId: string;
  adminDecision: "pending" | "accepted" | "rejected";
  orderStatus: string;
  publicOrderStatus: string;
  paymentStatus: string;
  rejectionReason?: string;
  createdAt?: string;
  confirmedAt?: string;
  packedAt?: string;
  pickedUpAt?: string;
  inTransitAt?: string;
  shippedAt?: string;
  outForDeliveryAt?: string;
  deliveredAt?: string;
};

const stageIcons: Partial<Record<OrderStatusKey, typeof CheckCircle2>> = {
  placed: CheckCircle2,
  waiting_confirmation: Clock,
  confirmed: CheckCircle2,
  packed: PackageCheck,
  picked_up: Truck,
  in_transit: Truck,
  out_for_delivery: Truck,
  delivered: CheckCircle2,
};

const stageTimes: Record<string, keyof TrackedOrder> = {
  placed: "createdAt",
  waiting_confirmation: "createdAt",
  confirmed: "confirmedAt",
  packed: "packedAt",
  picked_up: "pickedUpAt",
  in_transit: "inTransitAt",
  out_for_delivery: "outForDeliveryAt",
  delivered: "deliveredAt",
};

export function TrackOrderClient() {
  const [orderId, setOrderId] = useState("");
  const [contact, setContact] = useState("");
  const [errors, setErrors] = useState<{ orderId?: string; contact?: string }>({});
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [lookupError, setLookupError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextOrderId = params.get("orderId");
    if (nextOrderId) setOrderId(nextOrderId);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!orderId.trim()) next.orderId = "Order ID is required.";
    if (!contact.trim()) next.contact = "Email or phone is required.";
    setErrors(next);
    setSearched(false);
    if (Object.keys(next).length) return;
    setLoading(true);
    setLookupError("");
    setOrder(null);
    try {
      const response = await fetch(apiUrl("/api/orders/track"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, contact }),
      });
      const data = (await response.json().catch(() => null)) as
        | { order?: TrackedOrder | null; error?: string }
        | null;
      if (!response.ok) {
        setLookupError(data?.error || "Unable to track this order right now.");
      } else {
        setOrder(data?.order || null);
      }
    } catch {
      setLookupError("Unable to reach order tracking. Please try again.");
    }
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
              placeholder="Email address or +91..."
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

      {searched && lookupError && (
        <section className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
          <h2 className="font-display text-2xl font-semibold">Tracking unavailable</h2>
          <p className="mt-2 text-sm text-red-700">{lookupError}</p>
        </section>
      )}

      {searched && order && (
        <OrderStatusPanel order={order} />
      )}

      {searched && !order && !lookupError && (
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

function dateLabel(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function OrderStatusPanel({ order }: { order: TrackedOrder }) {
  const rejected =
    order.adminDecision === "rejected" ||
    ["rejected", "cancelled"].includes(order.orderStatus);
  const pending = order.adminDecision === "pending";
  const currentStatus = normalizeOrderStatus(order.publicOrderStatus || order.orderStatus);
  const currentIndex = orderStatusIndex(currentStatus);

  if (pending) {
    return (
      <StatusCard
        icon={<Clock className="h-8 w-8" />}
        title="Waiting for confirmation"
        message="Your order has been placed and is waiting for admin confirmation. You will see the next steps once it is accepted."
      />
    );
  }

  if (rejected) {
    return (
      <StatusCard
        icon={<SearchX className="h-8 w-8" />}
        title="Order rejected"
        message={
          order.rejectionReason ||
          "Your order could not be confirmed. Please contact CLINVARA support."
        }
      />
    );
  }

  return (
    <section className="mt-8 rounded-2xl border border-[var(--brand-border)] bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-text-muted)]">
        Order {order.orderId}
      </p>
      <h2 className="mt-2 font-display text-3xl font-semibold">Order confirmed</h2>
      <p className="mt-2 text-sm text-[var(--brand-text-muted)]">
        Your CLINVARA order is moving through fulfilment.
      </p>
      <ol className="mt-6 space-y-4">
        {orderTimelineSteps.map((stage, index) => {
          const Icon = stageIcons[stage.key] || Clock;
          const done = index <= currentIndex;
          const timestamp = order[stageTimes[stage.key]] as string | undefined;
          return (
            <li key={stage.key} className="flex gap-3">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
                  done ? "border-black bg-black text-white" : "border-[var(--brand-border)]"
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold">{stage.label}</span>
                <span className="text-xs text-[var(--brand-text-muted)]">
                  {timestamp ? dateLabel(timestamp) : done ? "Updated" : "Pending"}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
      <a
        href="mailto:clinvaraglobal@gmail.com"
        className="mt-6 inline-flex rounded-full border border-black px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em]"
      >
        Contact Support
      </a>
      <a
        href="tel:+917207118111"
        className="ml-3 mt-6 inline-flex rounded-full border border-black px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em]"
      >
        Call +91 72071 18111
      </a>
    </section>
  );
}

function StatusCard({
  icon,
  title,
  message,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
}) {
  return (
    <section className="mt-8 rounded-2xl border border-[var(--brand-border)] bg-white p-6 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-off-white)]">
        {icon}
      </div>
      <h2 className="mt-3 font-display text-2xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-[var(--brand-text-muted)]">
        {message}
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <a
          href="mailto:clinvaraglobal@gmail.com"
          className="rounded-full border border-black px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em]"
        >
          Email Support
        </a>
        <a
          href="tel:+917207118111"
          className="rounded-full border border-black px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em]"
        >
          Call +91 72071 18111
        </a>
      </div>
    </section>
  );
}
