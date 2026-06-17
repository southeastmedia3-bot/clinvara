"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageSquareText, Star, StarHalf, ThumbsDown, ThumbsUp, Trash2 } from "lucide-react";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminTable } from "@/components/admin/AdminTable";
import { Header } from "@/components/admin/ProductsAdmin";
import { deleteReview, listReviews, updateReview } from "@/lib/admin/firestore";
import type { AdminReview } from "@/lib/admin/types";

type ProductReviewSummary = {
  productKey: string;
  productName: string;
  reviewCount: number;
  averageRating: number;
};

function numericRating(review: AdminReview) {
  const rating = Number(review.rating);
  if (!Number.isFinite(rating) || rating < 1) return 0;
  return Math.max(1, Math.min(5, Math.round(rating)));
}

function reviewDateValue(review: AdminReview) {
  const value = review.createdAt || review.updatedAt || review.date;

  if (!value) return 0;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (typeof value === "object" && value && "seconds" in value) {
    return Number((value as { seconds?: number }).seconds || 0) * 1000;
  }
  if (typeof value === "object" && value && "toDate" in value) {
    const date = (value as { toDate: () => Date }).toDate();
    return date.getTime();
  }

  return 0;
}

function reviewDateLabel(review: AdminReview) {
  const value = reviewDateValue(review);
  if (!value) return review.date || "Not dated";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function reviewerName(review: AdminReview) {
  return review.customerName || review.name || "CLINVARA Customer";
}

function productName(review: AdminReview) {
  return review.productName || review.productSlug || "Unassigned product";
}

function productKey(review: AdminReview) {
  return review.productSlug || review.productName || "unassigned-product";
}

function averageRating(reviews: AdminReview[]) {
  if (!reviews.length) return 0;
  const total = reviews.reduce((sum, review) => sum + numericRating(review), 0);
  return total / reviews.length;
}

function formatRating(value: number) {
  return value ? value.toFixed(1) : "0.0";
}

function productSummaries(reviews: AdminReview[]): ProductReviewSummary[] {
  const grouped = new Map<string, { productName: string; reviews: AdminReview[] }>();

  reviews.forEach((review) => {
    const key = productKey(review);
    const existing = grouped.get(key);
    if (existing) {
      existing.reviews.push(review);
    } else {
      grouped.set(key, {
        productName: productName(review),
        reviews: [review],
      });
    }
  });

  return Array.from(grouped.entries()).map(([key, value]) => ({
    productKey: key,
    productName: value.productName,
    reviewCount: value.reviews.length,
    averageRating: averageRating(value.reviews),
  }));
}

function RatingDistribution({
  distribution,
  total,
}: {
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
  total: number;
}) {
  return (
    <section className="rounded-lg border border-[var(--brand-border)] bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-text-muted)]">
            Rating Distribution
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold">
            Review spread
          </h2>
        </div>
        <Star className="h-5 w-5" />
      </div>

      <div className="mt-6 space-y-4">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = distribution[rating as 1 | 2 | 3 | 4 | 5];
          const percentage = total ? Math.round((count / total) * 100) : 0;

          return (
            <div key={rating} className="grid grid-cols-[42px_1fr_72px] items-center gap-3 text-sm">
              <span className="font-semibold">{rating}★</span>
              <div className="h-3 overflow-hidden rounded-full bg-[var(--brand-off-white)]">
                <div
                  className="h-full rounded-full bg-black transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-right text-[var(--brand-text-muted)]">
                {count} ({percentage}%)
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

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

  const analytics = useMemo(() => {
    const ratedReviews = reviews.filter((review) => numericRating(review) > 0);
    const distribution = ratedReviews.reduce(
      (next, review) => {
        next[numericRating(review) as 1 | 2 | 3 | 4 | 5] += 1;
        return next;
      },
      { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number>,
    );
    const summaries = productSummaries(ratedReviews);

    return {
      totalReviews: reviews.length,
      ratedReviews: ratedReviews.length,
      averageRating: averageRating(ratedReviews),
      fiveStarReviews: distribution[5],
      oneStarReviews: distribution[1],
      distribution,
      recentReviews: [...reviews]
        .sort((a, b) => reviewDateValue(b) - reviewDateValue(a))
        .slice(0, 8),
      mostReviewedProducts: [...summaries]
        .sort((a, b) => b.reviewCount - a.reviewCount || b.averageRating - a.averageRating)
        .slice(0, 6),
      highestRatedProducts: [...summaries]
        .sort((a, b) => b.averageRating - a.averageRating || b.reviewCount - a.reviewCount)
        .slice(0, 6),
    };
  }, [reviews]);

  return (
    <div className="space-y-6">
      <Header title="Reviews" description="Moderate reviews and understand customer sentiment." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Total reviews"
          value={analytics.totalReviews}
          detail="All submitted reviews in Firestore."
          icon={MessageSquareText}
        />
        <AdminStatCard
          label="Average rating"
          value={formatRating(analytics.averageRating)}
          detail="Based on reviews with valid ratings."
          icon={StarHalf}
        />
        <AdminStatCard
          label="5-star reviews"
          value={analytics.fiveStarReviews}
          detail="Highest satisfaction signals."
          icon={ThumbsUp}
        />
        <AdminStatCard
          label="1-star reviews"
          value={analytics.oneStarReviews}
          detail="Needs attention or follow-up."
          icon={ThumbsDown}
        />
      </div>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <RatingDistribution
          distribution={analytics.distribution}
          total={analytics.ratedReviews}
        />

        <div>
          <h2 className="mb-4 font-display text-2xl font-semibold">Recent Reviews</h2>
          <AdminTable
            columns={["Reviewer", "Product", "Rating", "Date"]}
            empty={!analytics.recentReviews.length}
          >
            {analytics.recentReviews.map((review) => (
              <tr key={review.id}>
                <td className="px-4 py-4 font-medium">{reviewerName(review)}</td>
                <td className="px-4 py-4 text-[var(--brand-text-muted)]">
                  {productName(review)}
                </td>
                <td className="px-4 py-4">{numericRating(review) || "-"}</td>
                <td className="px-4 py-4">{reviewDateLabel(review)}</td>
              </tr>
            ))}
          </AdminTable>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div>
          <h2 className="mb-4 font-display text-2xl font-semibold">Most Reviewed Products</h2>
          <AdminTable
            columns={["Product", "Review count", "Average rating"]}
            empty={!analytics.mostReviewedProducts.length}
          >
            {analytics.mostReviewedProducts.map((product) => (
              <tr key={product.productKey}>
                <td className="px-4 py-4 font-medium">{product.productName}</td>
                <td className="px-4 py-4">{product.reviewCount}</td>
                <td className="px-4 py-4">{formatRating(product.averageRating)}</td>
              </tr>
            ))}
          </AdminTable>
        </div>

        <div>
          <h2 className="mb-4 font-display text-2xl font-semibold">Highest Rated Products</h2>
          <AdminTable
            columns={["Product", "Average rating", "Review count"]}
            empty={!analytics.highestRatedProducts.length}
          >
            {analytics.highestRatedProducts.map((product) => (
              <tr key={product.productKey}>
                <td className="px-4 py-4 font-medium">{product.productName}</td>
                <td className="px-4 py-4">{formatRating(product.averageRating)}</td>
                <td className="px-4 py-4">{product.reviewCount}</td>
              </tr>
            ))}
          </AdminTable>
        </div>
      </section>

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
