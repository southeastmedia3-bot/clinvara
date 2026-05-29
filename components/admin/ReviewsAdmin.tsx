"use client";

import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { AdminTable } from "@/components/admin/AdminTable";
import { Header } from "@/components/admin/ProductsAdmin";
import { deleteReview, listReviews, updateReview } from "@/lib/admin/firestore";
import type { AdminReview } from "@/lib/admin/types";

export function ReviewsAdmin() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    setReviews(await listReviews().catch(() => []));
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
  }, []);

  const filtered = useMemo(() => {
    if (status === "all") return reviews;
    return reviews.filter((review) => (review.status || "pending") === status);
  }, [reviews, status]);

  return (
    <div className="space-y-6">
      <Header title="Reviews" description="Moderate submitted reviews before they appear publicly." />
      <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-md border border-[var(--brand-border)] bg-white px-4 py-3 text-sm">
        <option value="all">All statuses</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
      {loading ? (
        <div className="skeleton h-64 rounded-lg" />
      ) : (
        <AdminTable columns={["Review", "Product", "Rating", "Status", "Actions"]} empty={!filtered.length}>
          {filtered.map((review) => (
            <tr key={review.id}>
              <td className="px-4 py-4">
                <div className="font-medium">{review.title || review.customerName || "Review"}</div>
                <div className="max-w-md text-xs text-[var(--brand-text-muted)]">{review.body || "-"}</div>
              </td>
              <td className="px-4 py-4">{review.productName || review.productSlug || "-"}</td>
              <td className="px-4 py-4">{review.rating || "-"}</td>
              <td className="px-4 py-4">{review.status || "pending"}</td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => void updateReview(review.id, { status: "approved" }).then(refresh)} className="rounded-full border border-[var(--brand-border)] px-3 py-2 text-xs">
                    Approve
                  </button>
                  <button type="button" onClick={() => void updateReview(review.id, { status: "rejected" }).then(refresh)} className="rounded-full border border-[var(--brand-border)] px-3 py-2 text-xs">
                    Reject
                  </button>
                  <button type="button" aria-label="Delete review" onClick={() => void deleteReview(review.id).then(refresh)} className="rounded-full border border-[var(--brand-border)] p-2">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}
    </div>
  );
}
