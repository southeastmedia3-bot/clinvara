"use client";

import { useEffect, useMemo, useState } from "react";
import { PackageCheck } from "lucide-react";
import { AdminTable } from "@/components/admin/AdminTable";
import { Header } from "@/components/admin/ProductsAdmin";
import { listReturns, updateReturn } from "@/lib/admin/firestore";
import type { AdminReturn } from "@/lib/admin/types";
import { firebaseAuth } from "@/lib/firebase/client";
import { apiUrl } from "@/lib/api/client";
import {
  allowedReturnTransitions,
  normalizeReturnStatus,
  returnStatusLabel,
  type ReturnStatus,
} from "@/lib/returns/status";

function timestampLabel(value: unknown) {
  if (!value) return "Not dated";
  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Not dated" : date.toLocaleString("en-IN");
  }
  if (typeof value === "object" && value && "seconds" in value) {
    const seconds = Number((value as { seconds?: number }).seconds || 0);
    return seconds ? new Date(seconds * 1000).toLocaleString("en-IN") : "Not dated";
  }
  if (typeof value === "object" && value && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate().toLocaleString("en-IN");
  }
  return "Not dated";
}

function statusTone(status?: string) {
  const normalized = normalizeReturnStatus(status);
  if (normalized === "refunded") return "bg-green-50 text-green-700";
  if (normalized === "rejected") return "bg-red-50 text-red-700";
  if (normalized === "received" || normalized === "approved") {
    return "bg-blue-50 text-blue-700";
  }
  return "bg-amber-50 text-amber-700";
}

function ReturnStatusBadge({ status }: { status?: string }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone(status)}`}>
      {returnStatusLabel(status)}
    </span>
  );
}

const actionLabels: Record<ReturnStatus, string> = {
  requested: "Requested",
  approved: "Approve",
  rejected: "Reject",
  received: "Mark Received",
  refunded: "Mark Refunded",
};

export function ReturnsAdmin() {
  const [returns, setReturns] = useState<AdminReturn[]>([]);
  const [selected, setSelected] = useState<AdminReturn | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const next = await listReturns().catch(() => []);
    setReturns(next);
    setLoading(false);
    setSelected((current) =>
      current ? next.find((item) => item.id === current.id) ?? null : null,
    );
  }

  useEffect(() => {
    void refresh();
  }, []);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return returns;
    return returns.filter(
      (item) => normalizeReturnStatus(item.status) === statusFilter,
    );
  }, [returns, statusFilter]);

  async function updateStatus(item: AdminReturn, status: ReturnStatus) {
    const current = normalizeReturnStatus(item.status);
    if (!allowedReturnTransitions(current).includes(status)) return;
    const token = await firebaseAuth.currentUser?.getIdToken().catch(() => "");
    const response = token
      ? await fetch(apiUrl("/api/returns/admin-update"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ returnId: item.id, status }),
        }).catch(() => null)
      : null;

    if (!response?.ok) {
      await updateReturn(item.id, { status });
    }
    await refresh();
  }

  return (
    <div className="space-y-6">
      <Header
        title="Returns"
        description="Review customer return requests and update return status."
      />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-md border border-[var(--brand-border)] bg-white px-4 py-3 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="requested">Requested</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="received">Received</option>
          <option value="refunded">Refunded</option>
        </select>
        <p className="text-sm text-[var(--brand-text-muted)]">
          {filtered.length} return {filtered.length === 1 ? "request" : "requests"}
        </p>
      </div>

      {loading ? (
        <div className="skeleton h-64 rounded-lg" />
      ) : (
        <AdminTable
          columns={["Return ID", "Order ID", "Customer", "Product", "Reason", "Status", "Date"]}
          empty={!filtered.length}
        >
          {filtered.map((item) => (
            <tr
              key={item.id}
              className="cursor-pointer hover:bg-[var(--brand-off-white)]"
              onClick={() => setSelected(item)}
            >
              <td className="px-4 py-4 font-medium">{item.id.slice(0, 8)}</td>
              <td className="px-4 py-4">{item.orderDisplayId || item.orderId || "-"}</td>
              <td className="px-4 py-4 text-[var(--brand-text-muted)]">
                {item.customerName || item.customerEmail || item.customerId || "Customer"}
              </td>
              <td className="px-4 py-4">{item.productName || item.productSlug || "-"}</td>
              <td className="px-4 py-4">{item.reason || "-"}</td>
              <td className="px-4 py-4">
                <ReturnStatusBadge status={item.status} />
              </td>
              <td className="px-4 py-4">{timestampLabel(item.createdAt)}</td>
            </tr>
          ))}
        </AdminTable>
      )}

      {selected && (
        <section className="rounded-lg border border-[var(--brand-border)] bg-white p-5">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-text-muted)]">
                Return Details
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold">
                {selected.productName || "Return request"}
              </h2>
              <p className="mt-1 text-sm text-[var(--brand-text-muted)]">
                Return ID: {selected.id}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="text-sm font-semibold underline"
            >
              Close
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              ["Customer", selected.customerName || selected.customerEmail || selected.customerId || "-"],
              ["Order", selected.orderDisplayId || selected.orderId || "-"],
              ["Product", selected.productName || selected.productSlug || "-"],
              ["Reason", selected.reason || "-"],
              ["Current Status", returnStatusLabel(selected.status)],
              ["Created", timestampLabel(selected.createdAt)],
              ["Updated", timestampLabel(selected.updatedAt)],
              ["Notes", selected.notes || "-"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-[var(--brand-off-white)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-text-muted)]">
                  {label}
                </p>
                <p className="mt-2 text-sm font-medium">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {allowedReturnTransitions(selected.status).length ? (
              allowedReturnTransitions(selected.status).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => void updateStatus(selected, status)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
                    status === "rejected"
                      ? "border border-red-700 text-red-700"
                      : "bg-black text-white"
                  }`}
                >
                  <PackageCheck className="h-4 w-4" />
                  {actionLabels[status]}
                </button>
              ))
            ) : (
              <p className="text-sm text-[var(--brand-text-muted)]">
                No further status actions are available for this return.
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
