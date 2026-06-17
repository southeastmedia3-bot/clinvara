"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, PackageSearch, RotateCcw, Truck } from "lucide-react";
import {
  customerOrderStatus,
  displayOrderId,
  listCustomerOrders,
  orderDateLabel,
  orderItems,
  type CustomerOrderRecord,
} from "@/lib/firebase/customerOrders";
import { useAuthStore } from "@/lib/store/authStore";

function money(value: number | undefined) {
  return `INR ${Number(value || 0).toLocaleString("en-IN")}`;
}

function productPreview(order: CustomerOrderRecord) {
  const items = orderItems(order);
  if (!items.length) return "Product details unavailable";
  const names = items.slice(0, 2).map((item) => item.name || "CLINVARA product");
  const more = items.length > 2 ? ` +${items.length - 2} more` : "";
  return `${names.join(", ")}${more}`;
}

export default function OrdersClient() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setLoginOpen = useAuthStore((state) => state.setLoginModalOpen);
  const [orders, setOrders] = useState<CustomerOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!user?.uid) {
        setOrders([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const nextOrders = await listCustomerOrders({ uid: user.uid, email: user.email }).catch(
        () => [],
      );
      if (!active) return;
      setOrders(nextOrders);
      setLoading(false);
    }

    if (isAuthenticated) {
      void load();
    } else {
      setLoading(false);
    }

    return () => {
      active = false;
    };
  }, [isAuthenticated, user?.email, user?.uid]);

  if (!isAuthenticated) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
        <section className="rounded-2xl border border-[var(--brand-border)] bg-white p-8 text-center">
          <h1 className="font-display text-4xl font-semibold">Sign in to view orders</h1>
          <p className="mt-3 text-sm text-[var(--brand-text-muted)]">
            Your order history is private to your CLINVARA account.
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

  return (
    <main className="mx-auto max-w-[1180px] px-4 py-10 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Link href="/account" className="text-sm font-semibold underline">
            Back to Account
          </Link>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-text-muted)]">
            CLINVARA Account
          </p>
          <h1 className="mt-2 font-display text-5xl font-semibold">Your Orders</h1>
          <p className="mt-2 text-sm text-[var(--brand-text-muted)]">
            Track purchases, download invoices, and start returns from one place.
          </p>
        </div>
        <Link
          href="/track-order"
          className="inline-flex h-11 items-center justify-center rounded-full border border-black px-6 text-sm font-semibold"
        >
          Track by Order ID
        </Link>
      </div>

      {loading ? (
        <div className="mt-8 space-y-4">
          {[0, 1, 2].map((item) => (
            <div key={item} className="skeleton h-44 rounded-2xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <section className="mt-8 rounded-2xl border border-dashed border-[var(--brand-border)] bg-white p-10 text-center">
          <PackageSearch className="mx-auto h-9 w-9 text-[var(--brand-text-muted)]" />
          <h2 className="mt-4 font-display text-3xl font-semibold">No orders yet</h2>
          <p className="mt-2 text-sm text-[var(--brand-text-muted)]">
            Your purchases, invoices, tracking updates, and returns will appear here.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white"
          >
            Continue Shopping
          </Link>
        </section>
      ) : (
        <section className="mt-8 space-y-4">
          {orders.map((order) => {
            const items = orderItems(order);
            return (
              <article
                key={order.id}
                className="rounded-2xl border border-[var(--brand-border)] bg-white p-5 sm:p-6"
              >
                <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="font-semibold">{displayOrderId(order)}</p>
                      <span className="rounded-full bg-[var(--brand-off-white)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]">
                        {customerOrderStatus(order)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[var(--brand-text-muted)]">
                      Ordered on {orderDateLabel(order.placedAt || order.createdAt)}
                    </p>
                    <p className="mt-3 text-sm">{productPreview(order)}</p>
                    {items.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {items.slice(0, 4).map((item, index) => (
                          <span
                            key={`${item.name}-${index}`}
                            className="rounded-full border border-[var(--brand-border)] px-3 py-1 text-xs text-[var(--brand-text-muted)]"
                          >
                            {item.name || "CLINVARA product"} x {item.quantity || 1}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="lg:text-right">
                    <p className="text-sm text-[var(--brand-text-muted)]">Order Total</p>
                    <p className="mt-1 text-xl font-semibold">
                      {money(order.totalAmount ?? order.subtotal)}
                    </p>
                    <p className="mt-2 text-sm capitalize text-[var(--brand-text-muted)]">
                      {order.paymentMethod || order.paymentStatus || "Payment pending"}
                    </p>
                  </div>
                </div>

                {order.rejectionReason && (
                  <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                    {order.rejectionReason}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={`/account/orders/${encodeURIComponent(order.id)}`}
                    className="inline-flex h-10 items-center justify-center rounded-full bg-black px-5 text-sm font-semibold text-white"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/account/orders/${encodeURIComponent(order.id)}#order-tracking`}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-black px-5 text-sm font-semibold"
                  >
                    <Truck className="h-4 w-4" />
                    Track Order
                  </Link>
                  <Link
                    href={`/account/orders/${encodeURIComponent(order.id)}#return-item`}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-black px-5 text-sm font-semibold"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Return Item
                  </Link>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-5 text-sm font-semibold"
                  >
                    <Download className="h-4 w-4" />
                    Download Invoice
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
