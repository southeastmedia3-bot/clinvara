"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { Check, Circle } from "lucide-react";
import { firebaseDb } from "@/lib/firebase/client";
import { useAuthStore } from "@/lib/store/authStore";
import { formatINR } from "@/lib/utils";
import {
  normalizeOrderStatus,
  orderStatusIndex,
  orderStatusLabel,
  orderTimelineSteps,
} from "@/lib/orders/status";
import { formatDate, getDeliveryEstimate } from "@/lib/delivery/estimate";

type OrderItem = {
  name?: string;
  quantity?: number;
  price?: number;
  size?: string;
  image?: string;
};

type OrderAddress = {
  fullName?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
};

type CustomerOrder = {
  id: string;
  orderId?: string;
  publicOrderId?: string;
  userId?: string;
  uid?: string;
  customerId?: string;
  email?: string;
  customerEmail?: string;
  items?: OrderItem[];
  products?: OrderItem[];
  subtotal?: number;
  totalAmount?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  status?: string;
  orderStatus?: string;
  publicOrderStatus?: string;
  adminDecision?: string;
  shippingAddress?: OrderAddress;
  address?: OrderAddress;
  createdAt?: unknown;
  placedAt?: unknown;
  estimatedDeliveryStart?: string;
  estimatedDeliveryEnd?: string;
  estimatedDeliveryLabel?: string;
  dispatchTimeDays?: number;
  deliveryRegion?: string;
};

function timestampLabel(value: unknown) {
  if (!value) return "Recently placed";
  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Recently placed" : date.toLocaleString("en-IN");
  }
  if (typeof value === "object" && value && "seconds" in value) {
    const seconds = Number((value as { seconds?: number }).seconds || 0);
    return seconds ? new Date(seconds * 1000).toLocaleString("en-IN") : "Recently placed";
  }
  if (typeof value === "object" && value && "toDate" in value) {
    const date = (value as { toDate: () => Date }).toDate();
    return date.toLocaleString("en-IN");
  }
  return "Recently placed";
}

function orderBelongsToUser(order: CustomerOrder, user: { uid?: string; email?: string } | null) {
  if (!user?.uid) return false;
  return (
    order.userId === user.uid ||
    order.uid === user.uid ||
    order.customerId === user.uid ||
    Boolean(user.email && [order.email, order.customerEmail].includes(user.email))
  );
}

function addressText(address?: OrderAddress) {
  if (!address) return "Address not available";
  return [
    address.fullName,
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.pincode,
  ]
    .filter(Boolean)
    .join(", ");
}

async function findOrder(orderId: string) {
  const direct = await getDoc(doc(firebaseDb, "orders", orderId)).catch(() => null);
  if (direct?.exists()) {
    return { id: direct.id, ...(direct.data() as Omit<CustomerOrder, "id">) };
  }

  return null;
}

export default function OrderDetailsClient({ orderId }: { orderId: string }) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setLoginOpen = useAuthStore((state) => state.setLoginModalOpen);
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadOrder() {
      setLoading(true);
      setDenied(false);
      const next = await findOrder(orderId);
      if (!active) return;
      if (!next || !orderBelongsToUser(next, user)) {
        setOrder(null);
        setDenied(Boolean(next));
        setLoading(false);
        return;
      }
      setOrder(next);
      setLoading(false);
    }

    if (isAuthenticated && user?.uid) {
      void loadOrder();
    } else {
      setLoading(false);
      setOrder(null);
    }

    return () => {
      active = false;
    };
  }, [isAuthenticated, orderId, user]);

  const items = order?.items?.length ? order.items : order?.products || [];
  const address = order?.shippingAddress || order?.address;
  const currentStatus = normalizeOrderStatus(
    order?.publicOrderStatus || order?.orderStatus || order?.status,
  );
  const currentIndex = orderStatusIndex(currentStatus);
  const deliveryEstimate = useMemo(() => {
    if (!order) return null;
    if (order.estimatedDeliveryLabel) {
      return {
        label: order.estimatedDeliveryLabel,
        region: order.deliveryRegion || "India",
      };
    }
    return getDeliveryEstimate({
      dispatchTimeDays: order.dispatchTimeDays || 1,
      address,
    });
  }, [address, order]);

  if (!isAuthenticated) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
        <section className="rounded-2xl border border-[var(--brand-border)] bg-white p-8 text-center">
          <h1 className="font-display text-4xl font-semibold">Sign in to view order details</h1>
          <p className="mt-3 text-sm text-[var(--brand-text-muted)]">
            Order details are private to the account that placed the order.
          </p>
          <button
            type="button"
            onClick={() => setLoginOpen(true)}
            className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white"
          >
            Sign In
          </button>
        </section>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
        <div className="skeleton h-80 rounded-2xl" />
      </main>
    );
  }

  if (!order || denied) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
        <section className="rounded-2xl border border-[var(--brand-border)] bg-white p-8 text-center">
          <h1 className="font-display text-4xl font-semibold">Order not found</h1>
          <p className="mt-3 text-sm text-[var(--brand-text-muted)]">
            We could not find this order for your signed-in account.
          </p>
          <Link href="/account" className="mt-6 inline-flex rounded-full bg-black px-6 py-3 text-sm font-semibold text-white">
            Back to Account
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
      <Link href="/account" className="text-sm font-semibold underline">
        Back to Account
      </Link>

      <section className="mt-6 rounded-2xl border border-[var(--brand-border)] bg-white p-6">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-text-muted)]">
              Order Details
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold">
              {order.publicOrderId || order.orderId || order.id}
            </h1>
            <p className="mt-2 text-sm text-[var(--brand-text-muted)]">
              Placed on {timestampLabel(order.placedAt || order.createdAt)}
            </p>
          </div>
          <span className="rounded-full bg-[var(--brand-off-white)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em]">
            {orderStatusLabel(currentStatus)}
          </span>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="font-display text-2xl font-semibold">Products Ordered</h2>
            <div className="mt-4 space-y-3">
              {items.length ? (
                items.map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="flex items-center justify-between gap-4 rounded-xl bg-[var(--brand-off-white)] p-4 text-sm"
                  >
                    <div>
                      <p className="font-semibold">{item.name || "CLINVARA product"}</p>
                      <p className="text-[var(--brand-text-muted)]">
                        Qty {item.quantity || 1}
                        {item.size ? ` - ${item.size}` : ""}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatINR(Number(item.price || 0) * Number(item.quantity || 1))}
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-xl bg-[var(--brand-off-white)] p-4 text-sm text-[var(--brand-text-muted)]">
                  Product details are not available for this order.
                </p>
              )}
            </div>

            <div className="mt-6 rounded-xl border border-[var(--brand-border)] p-4">
              <h2 className="font-display text-2xl font-semibold">Tracking Timeline</h2>
              <ol className="mt-5 space-y-4">
                {orderTimelineSteps.map((step, index) => {
                  const complete = index < currentIndex;
                  const active = index === currentIndex;
                  return (
                    <li key={step.key} className="flex gap-3">
                      <span
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                          complete || active
                            ? "border-black bg-black text-white"
                            : "border-[var(--brand-border)] text-[var(--brand-text-muted)]"
                        }`}
                      >
                        {complete ? <Check className="h-4 w-4" /> : <Circle className="h-3 w-3" />}
                      </span>
                      <span>
                        <span className="block text-sm font-semibold">{step.label}</span>
                        <span className="text-xs text-[var(--brand-text-muted)]">
                          {active ? "Current step" : complete ? "Completed" : "Pending"}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-[var(--brand-border)] p-4">
              <h2 className="font-display text-2xl font-semibold">Summary</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--brand-text-muted)]">Subtotal</span>
                  <strong>{formatINR(Number(order.totalAmount ?? order.subtotal ?? 0))}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--brand-text-muted)]">Payment Method</span>
                  <strong>{order.paymentMethod || "Payment pending"}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--brand-text-muted)]">Payment Status</span>
                  <strong className="capitalize">{order.paymentStatus || "pending"}</strong>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--brand-border)] p-4">
              <h2 className="font-display text-2xl font-semibold">Shipping Address</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--brand-text-muted)]">
                {addressText(address)}
              </p>
              {address?.phone && (
                <p className="mt-2 text-sm text-[var(--brand-text-muted)]">{address.phone}</p>
              )}
            </div>

            <div className="rounded-xl border border-[var(--brand-border)] p-4">
              <h2 className="font-display text-2xl font-semibold">Estimated Delivery</h2>
              <p className="mt-3 text-sm font-semibold">{deliveryEstimate?.label}</p>
              <p className="mt-1 text-sm text-[var(--brand-text-muted)]">
                {deliveryEstimate?.region}
                {order.estimatedDeliveryStart && order.estimatedDeliveryEnd
                  ? ` - ${formatDate(order.estimatedDeliveryStart)} - ${formatDate(order.estimatedDeliveryEnd)}`
                  : ""}
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
