"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminTable } from "@/components/admin/AdminTable";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { Header } from "@/components/admin/ProductsAdmin";
import { listOrders, updateOrder } from "@/lib/admin/firestore";
import type { AdminOrder, OrderStatus } from "@/lib/admin/types";

const statuses: OrderStatus[] = [
  "Pending",
  "Accepted",
  "Packed",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Refunded",
];

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function orderStatus(order: AdminOrder) {
  return String(order.orderStatus || order.status || "Pending");
}

export function OrdersAdmin() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<AdminOrder | null>(null);
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
      const matchesStatus = status === "all" || orderStatus(order) === status;
      const matchesQuery = [
        order.id,
        order.orderId,
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
              onClick={() => setSelected(order)}
            >
              <td className="px-4 py-4 font-medium">{order.orderId || order.id}</td>
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
                Order {selected.orderId || selected.id}
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
            <label className="space-y-2 text-sm">
              <span className="font-medium">Order status</span>
              <select
                value={orderStatus(selected)}
                onChange={(event) =>
                  void saveOrder(selected, { orderStatus: event.target.value as OrderStatus })
                }
                className="w-full rounded-md border border-[var(--brand-border)] px-3 py-3"
              >
                {statuses.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
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
