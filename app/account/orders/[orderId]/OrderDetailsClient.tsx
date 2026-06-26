"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { Check, Circle, Download, RotateCcw, XCircle } from "lucide-react";
import { firebaseAuth, firebaseDb } from "@/lib/firebase/client";
import { useAuthStore } from "@/lib/store/authStore";
import { formatINR } from "@/lib/utils";
import { apiUrl } from "@/lib/api/client";
import {
  normalizeOrderStatus,
  orderStatusIndex,
  orderStatusLabel,
  orderTimelineSteps,
} from "@/lib/orders/status";
import { formatDate, getDeliveryEstimate } from "@/lib/delivery/estimate";
import {
  createReturnRequest,
  listCustomerReturns,
  type CustomerReturnRequest,
} from "@/lib/firebase/returns";
import {
  returnReasons,
  returnStatusIndex,
  returnStatusLabel,
  returnStatusSteps,
  type ReturnReason,
} from "@/lib/returns/status";
import { canonicalProductName } from "@/lib/data/productBranding";

type OrderItem = {
  productId?: string;
  slug?: string;
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

function returnDateLabel(value: unknown) {
  if (!value) return "Recently requested";
  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Recently requested" : date.toLocaleString("en-IN");
  }
  if (typeof value === "object" && value && "seconds" in value) {
    const seconds = Number((value as { seconds?: number }).seconds || 0);
    return seconds ? new Date(seconds * 1000).toLocaleString("en-IN") : "Recently requested";
  }
  if (typeof value === "object" && value && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate().toLocaleString("en-IN");
  }
  return "Recently requested";
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
  const [returns, setReturns] = useState<CustomerReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnProductKey, setReturnProductKey] = useState("");
  const [returnReason, setReturnReason] = useState<ReturnReason>("Damaged Product");
  const [returnNotes, setReturnNotes] = useState("");
  const [returnMessage, setReturnMessage] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#return-item") {
      setShowReturnForm(true);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadOrder() {
      const customerId = user?.uid;
      if (!customerId) return;
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
      const nextReturns = await listCustomerReturns(customerId).catch(() => []);
      if (!active) return;
      setReturns(
        nextReturns
          .filter((item) => item.orderId === next.id)
          .sort((a, b) => {
            const aSeconds =
              typeof a.createdAt === "object" && a.createdAt && "seconds" in a.createdAt
                ? Number((a.createdAt as { seconds?: number }).seconds || 0)
                : 0;
            const bSeconds =
              typeof b.createdAt === "object" && b.createdAt && "seconds" in b.createdAt
                ? Number((b.createdAt as { seconds?: number }).seconds || 0)
                : 0;
            return bSeconds - aSeconds;
          }),
      );
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

  const items = (order?.items?.length ? order.items : order?.products || []).map((item) => ({
    ...item,
    name: canonicalProductName(item.slug || item.productId, item.name),
  }));
  const address = order?.shippingAddress || order?.address;
  const currentStatus = normalizeOrderStatus(
    order?.publicOrderStatus || order?.orderStatus || order?.status,
  );
  const currentIndex = orderStatusIndex(currentStatus);
  const canCancelOrder =
    Boolean(order) &&
    ["placed", "waiting_confirmation", "confirmed"].includes(currentStatus) &&
    !["rejected", "cancelled", "refunded"].includes(
      String(order?.orderStatus || order?.publicOrderStatus || order?.status || ""),
    );
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
  const selectedReturnItem = useMemo(() => {
    return items.find(
      (item, index) => `${item.productId || item.slug || item.name || "product"}-${index}` === returnProductKey,
    );
  }, [items, returnProductKey]);

  const submitReturnRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setReturnMessage("");

    const customerId = user?.uid;
    if (!order || !customerId) {
      setReturnMessage("Sign in to request a return.");
      return;
    }
    if (!selectedReturnItem) {
      setReturnMessage("Select the product you want to return.");
      return;
    }

    const returnId = await createReturnRequest({
      customerId,
      customerName: user.name || user.email || user.phone,
      customerEmail: user.email,
      orderId: order.id,
      orderDisplayId: order.publicOrderId || order.orderId || order.id,
      productId: selectedReturnItem.productId,
      productSlug: selectedReturnItem.slug,
      productName: selectedReturnItem.name || "CLINVARA product",
      reason: returnReason,
      notes: returnNotes.trim(),
    });

    setReturns((current) => [
      {
        id: returnId,
        customerId,
        customerName: user.name || user.email || user.phone,
        customerEmail: user.email,
        orderId: order.id,
        orderDisplayId: order.publicOrderId || order.orderId || order.id,
        productId: selectedReturnItem.productId,
        productSlug: selectedReturnItem.slug,
        productName: selectedReturnItem.name || "CLINVARA product",
        reason: returnReason,
        notes: returnNotes.trim(),
        status: "requested",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      ...current,
    ]);
    setReturnProductKey("");
    setReturnReason("Damaged Product");
    setReturnNotes("");
    setShowReturnForm(false);
    setReturnMessage("Return request submitted. Our team will review it shortly.");
  };

  const cancelOrder = async () => {
    if (!order || cancelLoading) return;
    setReturnMessage("");
    setCancelLoading(true);

    try {
      const token = await firebaseAuth.currentUser?.getIdToken();
      const response = await fetch(apiUrl("/api/orders/customer-cancel"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setReturnMessage(data?.error || "This order can no longer be cancelled.");
        return;
      }
      setOrder((current) =>
        current
          ? {
              ...current,
              status: "cancelled",
              orderStatus: "cancelled",
              publicOrderStatus: "cancelled",
              cancelledAt: new Date().toISOString(),
            }
          : current,
      );
      setReturnMessage("Order cancelled. Your order status has been updated.");
    } finally {
      setCancelLoading(false);
    }
  };

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
          <Link href="/account/orders" className="mt-6 inline-flex rounded-full bg-black px-6 py-3 text-sm font-semibold text-white">
            Back to Orders
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
      <Link href="/account/orders" className="text-sm font-semibold underline">
        Back to Orders
      </Link>

      <section className="mt-6 rounded-2xl border border-[var(--brand-border)] bg-white p-6">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-text-muted)]">
              Order Information
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

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              document.getElementById("order-tracking")?.scrollIntoView({ behavior: "smooth" })
            }
            className="inline-flex h-11 items-center justify-center rounded-full bg-black px-5 text-sm font-semibold text-white"
          >
            Track Order
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-black px-5 text-sm font-semibold"
          >
            <Download className="h-4 w-4" />
            Download Invoice
          </button>
          {canCancelOrder && (
            <button
              type="button"
              onClick={cancelOrder}
              disabled={cancelLoading}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-red-700 px-5 text-sm font-semibold text-red-700 transition hover:bg-red-700 hover:text-white disabled:cursor-wait disabled:opacity-60"
            >
              <XCircle className="h-4 w-4" />
              {cancelLoading ? "Cancelling..." : "Cancel Order"}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setShowReturnForm((value) => !value);
              setReturnMessage("");
            }}
            id="return-item"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-black px-5 text-sm font-semibold"
          >
            <RotateCcw className="h-4 w-4" />
            Return Item
          </button>
        </div>

        {returnMessage && (
          <p className="mt-4 rounded-xl bg-[var(--brand-off-white)] p-3 text-sm font-semibold">
            {returnMessage}
          </p>
        )}

        {showReturnForm && (
          <form
            onSubmit={submitReturnRequest}
            className="mt-6 grid gap-4 rounded-xl bg-[var(--brand-off-white)] p-5 md:grid-cols-2"
          >
            <label className="block text-sm font-medium">
              <span className="mb-2 block text-[var(--brand-text-muted)]">
                Product
              </span>
              <select
                required
                value={returnProductKey}
                onChange={(event) => {
                  setReturnProductKey(event.target.value);
                  setReturnMessage("");
                }}
                className="h-11 w-full rounded-full border border-[var(--brand-border)] bg-white px-4 text-sm outline-none focus:border-black"
              >
                <option value="">Select a product</option>
                {items.map((item, index) => (
                  <option
                    key={`${item.productId || item.slug || item.name || "product"}-${index}`}
                    value={`${item.productId || item.slug || item.name || "product"}-${index}`}
                  >
                    {item.name || "CLINVARA product"}
                    {item.size ? ` - ${item.size}` : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium">
              <span className="mb-2 block text-[var(--brand-text-muted)]">
                Return Reason
              </span>
              <select
                required
                value={returnReason}
                onChange={(event) => {
                  setReturnReason(event.target.value as ReturnReason);
                  setReturnMessage("");
                }}
                className="h-11 w-full rounded-full border border-[var(--brand-border)] bg-white px-4 text-sm outline-none focus:border-black"
              >
                {returnReasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium md:col-span-2">
              <span className="mb-2 block text-[var(--brand-text-muted)]">
                Additional Notes
              </span>
              <textarea
                value={returnNotes}
                onChange={(event) => {
                  setReturnNotes(event.target.value);
                  setReturnMessage("");
                }}
                rows={4}
                className="w-full rounded-2xl border border-[var(--brand-border)] bg-white px-4 py-3 text-sm outline-none focus:border-black"
                placeholder="Share details about the issue. Our support team may request photos after review."
              />
            </label>

            <div className="flex gap-3 md:col-span-2">
              <button
                type="submit"
                className="h-11 rounded-full bg-black px-6 text-sm font-semibold text-white"
              >
                Submit Return Request
              </button>
              <button
                type="button"
                onClick={() => setShowReturnForm(false)}
                className="h-11 rounded-full border border-black px-6 text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="font-display text-2xl font-semibold">Product Information</h2>
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

            <div id="order-tracking" className="mt-6 scroll-mt-24 rounded-xl border border-[var(--brand-border)] p-4">
              <h2 className="font-display text-2xl font-semibold">Tracking Information</h2>
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
              <h2 className="font-display text-2xl font-semibold">Payment Information</h2>
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

        <section className="mt-8 rounded-xl border border-[var(--brand-border)] p-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-2xl font-semibold">Return Information</h2>
              <p className="mt-1 text-sm text-[var(--brand-text-muted)]">
                Return requests attached to this order.
              </p>
            </div>
            <span className="rounded-full bg-[var(--brand-off-white)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]">
              {returns.length} {returns.length === 1 ? "Return" : "Returns"}
            </span>
          </div>

          {returns.length === 0 ? (
            <p className="mt-4 rounded-xl bg-[var(--brand-off-white)] p-4 text-sm text-[var(--brand-text-muted)]">
              No return requests have been created for this order.
            </p>
          ) : (
            <div className="mt-5 space-y-4">
              {returns.map((item) => {
                const rejected = item.status === "rejected";
                const statusIndex = returnStatusIndex(item.status);

                return (
                  <article
                    key={item.id}
                    className="rounded-xl border border-[var(--brand-border)] p-4"
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div>
                        <p className="font-semibold">{item.productName}</p>
                        <p className="mt-1 text-sm text-[var(--brand-text-muted)]">
                          {item.reason} - {returnDateLabel(item.createdAt)}
                        </p>
                        {item.notes && (
                          <p className="mt-2 rounded-xl bg-[var(--brand-off-white)] p-3 text-sm text-[var(--brand-text-muted)]">
                            {item.notes}
                          </p>
                        )}
                      </div>
                      <span
                        className={`h-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
                          rejected
                            ? "bg-red-50 text-red-700"
                            : item.status === "refunded"
                              ? "bg-green-50 text-green-700"
                              : "bg-[var(--brand-off-white)]"
                        }`}
                      >
                        {returnStatusLabel(item.status)}
                      </span>
                    </div>

                    {rejected ? (
                      <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                        This return was rejected. Contact CLINVARA support for help.
                      </p>
                    ) : (
                      <ol className="mt-5 grid gap-3 sm:grid-cols-4">
                        {returnStatusSteps.map((step, index) => {
                          const complete = index < statusIndex;
                          const active = index === statusIndex;

                          return (
                            <li key={step.key} className="flex gap-2 text-sm">
                              <span
                                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                                  complete || active
                                    ? "border-black bg-black text-white"
                                    : "border-[var(--brand-border)] text-[var(--brand-text-muted)]"
                                }`}
                              >
                                {complete ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Circle className="h-3 w-3" />
                                )}
                              </span>
                              <span>
                                <span className="block font-semibold">{step.label}</span>
                                <span className="text-xs text-[var(--brand-text-muted)]">
                                  {active ? "Current" : complete ? "Completed" : "Pending"}
                                </span>
                              </span>
                            </li>
                          );
                        })}
                      </ol>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
