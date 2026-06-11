"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminTable } from "@/components/admin/AdminTable";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { Header } from "@/components/admin/ProductsAdmin";
import { listOrders, updateOrder } from "@/lib/admin/firestore";
import type { AdminOrder, OrderStatus } from "@/lib/admin/types";
import { firebaseAuth } from "@/lib/firebase/client";
import { apiUrl } from "@/lib/api/client";

const statuses: OrderStatus[] = [
  "waiting_confirmation",
  "confirmed",
  "packed",
  "picked_up",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "refunded",
];

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function orderStatus(order: AdminOrder) {
  return String(order.orderStatus || order.status || "pending_admin_confirmation");
}

function timestampPatch(status: string) {
  const now = new Date().toISOString();
  if (status === "packed") return { packedAt: now };
  if (status === "picked_up") return { pickedUpAt: now };
  if (status === "in_transit") return { inTransitAt: now, shippedAt: now };
  if (status === "out_for_delivery") return { outForDeliveryAt: now };
  if (status === "delivered") return { deliveredAt: now };
  return {};
}

export function OrdersAdmin() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    setOrders(await listOrders().catch(() => []));
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
  }, []);

  const filtered = useMemo(() => {
    const needle = query.toLowerCase();
    return orders.filter((order) => {
      const normalizedStatus =
        orderStatus(order) === "pending_admin_confirmation" ? "waiting_confirmation" : orderStatus(order);
      const matchesStatus = status === "all" || normalizedStatus === status;
      const matchesQuery = [
        order.id,
        order.orderId,
        order.publicOrderId,
        order.customerName,
        order.customerEmail,
        order.email,
        order.customerPhone,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
      return matchesStatus && matchesQuery;
    });
  }, [orders, query, status]);

  async function saveOrder(order: AdminOrder, patch: Partial<AdminOrder>) {
    await updateOrder(order.id, patch);
    await refresh();
    setSelected((current) => (current?.id === order.id ? { ...current, ...patch } : current));
  }

  async function adminOrderAction(order: AdminOrder, action: "accept" | "reject" | "status", patch: Partial<AdminOrder>) {
    const token = await firebaseAuth.currentUser?.getIdToken();
    if (!token) {
      await saveOrder(order, patch);
      return;
    }
    const response = await fetch(apiUrl("/api/orders/admin-update"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ orderId: order.id, action, patch }),
    });
    if (!response.ok) {
      await saveOrder(order, patch);
      return;
    }
    await refresh();
    setSelected((current) => (current?.id === order.id ? { ...current, ...patch } : current));
  }

  async function acceptOrder(order: AdminOrder) {
    await adminOrderAction(order, "accept", {
      adminDecision: "accepted",
      orderStatus: "confirmed",
      publicOrderStatus: "confirmed",
      confirmedAt: new Date().toISOString(),
    } as Partial<AdminOrder>);
  }

  async function rejectOrder(order: AdminOrder) {
    await adminOrderAction(order, "reject", {
      adminDecision: "rejected",
      orderStatus: "rejected",
      publicOrderStatus: "rejected",
      rejectionReason,
      rejectedAt: new Date().toISOString(),
    } as Partial<AdminOrder>);
  }

  return (
    <div className="space-y-6">
      <Header title="Orders" description="Search, review, and update customer orders." />
      <div className="flex flex-col gap-3 md:flex-row">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search order, customer, email, phone"
          className="w-full rounded-md border border-[var(--brand-border)] bg-white px-4 py-3 text-sm md:max-w-sm"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-md border border-[var(--brand-border)] bg-white px-4 py-3 text-sm"
        >
          <option value="all">All statuses</option>
          {statuses.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="skeleton h-64 rounded-lg" />
      ) : (
        <AdminTable columns={["Order", "Customer", "Payment", "Status", "Total"]} empty={!filtered.length}>
          {filtered.map((order) => (
            <tr
              key={order.id}
              className="cursor-pointer hover:bg-[var(--brand-off-white)]"
              onClick={() => {
                setSelected(order);
                setRejectionReason(order.rejectionReason || "");
              }}
            >
              <td className="px-4 py-4 font-medium">{order.publicOrderId || order.orderId || order.id}</td>
              <td className="px-4 py-4 text-[var(--brand-text-muted)]">
                {order.customerName || order.customerEmail || order.email || "Customer"}
              </td>
              <td className="px-4 py-4">{order.paymentStatus || "not_connected"}</td>
              <td className="px-4 py-4">
                <OrderStatusBadge status={orderStatus(order)} />
              </td>
              <td className="px-4 py-4">{money(Number(order.totalAmount ?? order.subtotal ?? 0))}</td>
            </tr>
          ))}
        </AdminTable>
      )}

      {selected && (
        <div className="rounded-lg border border-[var(--brand-border)] bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-semibold">
                Order {selected.publicOrderId || selected.orderId || selected.id}
              </h2>
              <p className="text-sm text-[var(--brand-text-muted)]">
                {selected.customerEmail || selected.email || selected.checkoutEmail || "No email"}
              </p>
            </div>
            <button type="button" onClick={() => setSelected(null)} className="text-sm underline">
              Close
            </button>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {(!selected.adminDecision || selected.adminDecision === "pending") && (
              <div className="flex flex-wrap gap-2 md:col-span-2">
                <button
                  type="button"
                  onClick={() => void acceptOrder(selected)}
                  className="rounded-full bg-black px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white"
                >
                  Accept order
                </button>
                <button
                  type="button"
                  onClick={() => void rejectOrder(selected)}
                  className="rounded-full border border-red-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-red-700"
                >
                  Reject order
                </button>
              </div>
            )}
            {selected.adminDecision === "rejected" && selected.rejectionReason && (
              <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 md:col-span-2">
                Rejected: {selected.rejectionReason}
              </p>
            )}
            <label className="space-y-2 text-sm md:col-span-2">
              <span className="font-medium">Rejection reason</span>
              <input
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                placeholder="Optional reason shown to customer if rejected"
                className="w-full rounded-md border border-[var(--brand-border)] px-3 py-3"
              />
            </label>
            {selected.adminDecision === "accepted" && (
              <label className="space-y-2 text-sm">
                <span className="font-medium">Order status</span>
                <select
                  value={orderStatus(selected)}
                  onChange={(event) =>
                    void adminOrderAction(selected, "status", {
                      orderStatus: event.target.value as OrderStatus,
                      publicOrderStatus: event.target.value,
                      ...timestampPatch(event.target.value),
                    } as Partial<AdminOrder>)
                  }
                  className="w-full rounded-md border border-[var(--brand-border)] px-3 py-3"
                >
                  {statuses
                    .filter((item) => item !== "waiting_confirmation")
                    .map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                </select>
              </label>
            )}
            <label className="space-y-2 text-sm md:col-span-2">
              <span className="font-medium">Admin notes</span>
              <textarea
                defaultValue={selected.adminNotes || ""}
                onBlur={(event) => void saveOrder(selected, { adminNotes: event.target.value })}
                rows={4}
                className="w-full rounded-md border border-[var(--brand-border)] px-3 py-3"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
