"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  Package,
  ReceiptText,
  RotateCcw,
  Star,
  TrendingUp,
  Truck,
  Users,
  XCircle,
} from "lucide-react";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminTable } from "@/components/admin/AdminTable";
import { Header } from "@/components/admin/ProductsAdmin";
import {
  listCustomers,
  listOrders,
  listProducts,
  listReturns,
  listReviews,
} from "@/lib/admin/firestore";
import type {
  AdminCustomer,
  AdminOrder,
  AdminProduct,
  AdminReturn,
  AdminReview,
} from "@/lib/admin/types";
import { normalizeOrderStatus } from "@/lib/orders/status";
import { normalizeReturnStatus } from "@/lib/returns/status";

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function orderTotal(order: AdminOrder) {
  return Number(order.totalAmount ?? order.subtotal ?? 0);
}

function timestampMs(value: unknown) {
  if (!value) return 0;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (typeof value === "object" && value && "seconds" in value) {
    return Number((value as { seconds?: number }).seconds || 0) * 1000;
  }
  if (typeof value === "object" && value && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate().getTime();
  }
  return 0;
}

function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function previousMonthKey() {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return monthKey(date);
}

function itemMonthKey(value: unknown) {
  const time = timestampMs(value);
  return time ? monthKey(new Date(time)) : "";
}

function percent(value: number) {
  if (!Number.isFinite(value)) return "0%";
  return `${value.toFixed(1)}%`;
}

function ratingValue(review: AdminReview) {
  const rating = Number(review.rating);
  return Number.isFinite(rating) && rating > 0 ? Math.min(5, rating) : 0;
}

function MiniBars({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ label: string; value: number; display?: string }>;
}) {
  const max = Math.max(1, ...rows.map((row) => row.value));

  return (
    <section className="rounded-lg border border-[var(--brand-border)] bg-white p-5">
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      <div className="mt-5 space-y-4">
        {rows.map((row) => {
          const width = Math.round((row.value / max) * 100);
          return (
            <div key={row.label} className="space-y-2">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="font-medium">{row.label}</span>
                <span className="text-[var(--brand-text-muted)]">
                  {row.display ?? row.value}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-[var(--brand-off-white)]">
                <div className="h-full rounded-full bg-black" style={{ width: `${width}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function AnalyticsAdmin() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [returns, setReturns] = useState<AdminReturn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const [nextOrders, nextProducts, nextCustomers, nextReviews, nextReturns] =
        await Promise.all([
          listOrders().catch(() => []),
          listProducts().catch(() => []),
          listCustomers().catch(() => []),
          listReviews().catch(() => []),
          listReturns().catch(() => []),
        ]);
      if (!active) return;
      setOrders(nextOrders);
      setProducts(nextProducts);
      setCustomers(nextCustomers);
      setReviews(nextReviews);
      setReturns(nextReturns);
      setLoading(false);
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  const analytics = useMemo(() => {
    const nowKey = monthKey();
    const lastKey = previousMonthKey();
    const revenue = orders.reduce((sum, order) => sum + orderTotal(order), 0);
    const revenueThisMonth = orders
      .filter((order) => itemMonthKey(order.createdAt) === nowKey)
      .reduce((sum, order) => sum + orderTotal(order), 0);
    const revenueLastMonth = orders
      .filter((order) => itemMonthKey(order.createdAt) === lastKey)
      .reduce((sum, order) => sum + orderTotal(order), 0);
    const averageOrderValue = orders.length ? revenue / orders.length : 0;
    const revenueTrend = revenueLastMonth
      ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
      : revenueThisMonth
        ? 100
        : 0;

    const orderCounts = orders.reduce(
      (next, order) => {
        const status = normalizeOrderStatus(
          order.publicOrderStatus || order.orderStatus || order.status,
        );
        next.total += 1;
        if (status === "waiting_confirmation" || status === "placed") next.pending += 1;
        if (status === "confirmed") next.confirmed += 1;
        if (status === "in_transit" || status === "picked_up") next.shipped += 1;
        if (status === "delivered") next.delivered += 1;
        if (status === "cancelled" || status === "rejected") next.cancelled += 1;
        return next;
      },
      { total: 0, pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 },
    );

    const orderUserCounts = new Map<string, number>();
    orders.forEach((order) => {
      const key =
        order.userId || order.uid || order.customerId || order.customerEmail || order.email || "";
      if (key) orderUserCounts.set(key, (orderUserCounts.get(key) || 0) + 1);
    });
    const returningCustomers = Array.from(orderUserCounts.values()).filter(
      (count) => count > 1,
    ).length;
    const newCustomers = customers.filter((customer) => itemMonthKey(customer.createdAt) === nowKey)
      .length;

    const ratedReviews = reviews.filter((review) => ratingValue(review) > 0);
    const averageRating = ratedReviews.length
      ? ratedReviews.reduce((sum, review) => sum + ratingValue(review), 0) / ratedReviews.length
      : 0;
    const reviewsThisMonth = reviews.filter((review) => itemMonthKey(review.createdAt) === nowKey)
      .length;
    const reviewsLastMonth = reviews.filter((review) => itemMonthKey(review.createdAt) === lastKey)
      .length;
    const reviewGrowth = reviewsLastMonth
      ? ((reviewsThisMonth - reviewsLastMonth) / reviewsLastMonth) * 100
      : reviewsThisMonth
        ? 100
        : 0;

    const refundedReturns = returns.filter(
      (item) => normalizeReturnStatus(item.status) === "refunded",
    );
    const refundedOrderIds = new Set(refundedReturns.map((item) => item.orderId).filter(Boolean));
    const refundValue = orders
      .filter((order) => refundedOrderIds.has(order.id))
      .reduce((sum, order) => sum + orderTotal(order), 0);
    const returnRate = orders.length ? (returns.length / orders.length) * 100 : 0;

    const topProducts = new Map<string, number>();
    orders.forEach((order) => {
      const items = Array.isArray(order.items) ? order.items : [];
      items.forEach((item) => {
        const name =
          typeof item === "object" && item && "name" in item
            ? String((item as { name?: string }).name || "Product")
            : "Product";
        topProducts.set(name, (topProducts.get(name) || 0) + 1);
      });
    });

    return {
      revenue,
      revenueThisMonth,
      revenueLastMonth,
      averageOrderValue,
      revenueTrend,
      orderCounts,
      totalCustomers: customers.length,
      newCustomers,
      returningCustomers,
      averageRating,
      reviewsThisMonth,
      reviewGrowth,
      totalReturns: returns.length,
      returnRate,
      refundedOrders: refundedReturns.length,
      refundValue,
      lowStock: products.filter(
        (product) => Number(product.stock ?? 0) <= Number(product.lowStockThreshold ?? 5),
      ).length,
      topProducts: Array.from(topProducts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8),
    };
  }, [customers, orders, products, returns, reviews]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-12 w-72 rounded" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((item) => (
            <div key={item} className="skeleton h-36 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Header
        title="Analytics"
        description="Revenue, order, customer, review, and return analytics from Firestore."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Total Revenue"
          value={money(analytics.revenue)}
          detail={`Trend: ${percent(analytics.revenueTrend)}`}
          icon={TrendingUp}
        />
        <AdminStatCard
          label="Revenue This Month"
          value={money(analytics.revenueThisMonth)}
          detail={`Last month: ${money(analytics.revenueLastMonth)}`}
          icon={BarChart3}
        />
        <AdminStatCard
          label="Average Order Value"
          value={money(analytics.averageOrderValue)}
          detail="Total revenue divided by orders."
          icon={ReceiptText}
        />
        <AdminStatCard
          label="Total Orders"
          value={analytics.orderCounts.total}
          detail={`${analytics.orderCounts.pending} pending`}
          icon={Package}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Confirmed" value={analytics.orderCounts.confirmed} icon={CheckCircle2} />
        <AdminStatCard label="Shipped" value={analytics.orderCounts.shipped} icon={Truck} />
        <AdminStatCard label="Delivered" value={analytics.orderCounts.delivered} icon={CheckCircle2} />
        <AdminStatCard label="Cancelled" value={analytics.orderCounts.cancelled} icon={XCircle} />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Total Customers" value={analytics.totalCustomers} icon={Users} />
        <AdminStatCard label="New Customers" value={analytics.newCustomers} detail="Created this month." icon={Users} />
        <AdminStatCard label="Returning Customers" value={analytics.returningCustomers} detail="Customers with 2+ orders." icon={Users} />
        <AdminStatCard label="Low Stock" value={analytics.lowStock} icon={BarChart3} />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Average Rating" value={analytics.averageRating.toFixed(1)} icon={Star} />
        <AdminStatCard label="Reviews This Month" value={analytics.reviewsThisMonth} detail={`Growth: ${percent(analytics.reviewGrowth)}`} icon={Star} />
        <AdminStatCard label="Total Returns" value={analytics.totalReturns} detail={`Return rate: ${percent(analytics.returnRate)}`} icon={RotateCcw} />
        <AdminStatCard label="Refund Value" value={money(analytics.refundValue)} detail={`${analytics.refundedOrders} refunded returns`} icon={RotateCcw} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <MiniBars
          title="Revenue Trend"
          rows={[
            {
              label: "Last Month",
              value: analytics.revenueLastMonth,
              display: money(analytics.revenueLastMonth),
            },
            {
              label: "This Month",
              value: analytics.revenueThisMonth,
              display: money(analytics.revenueThisMonth),
            },
          ]}
        />
        <MiniBars
          title="Order Status Mix"
          rows={[
            { label: "Pending", value: analytics.orderCounts.pending },
            { label: "Confirmed", value: analytics.orderCounts.confirmed },
            { label: "Shipped", value: analytics.orderCounts.shipped },
            { label: "Delivered", value: analytics.orderCounts.delivered },
            { label: "Cancelled", value: analytics.orderCounts.cancelled },
          ]}
        />
      </section>

      <AdminTable columns={["Top product", "Order lines"]} empty={!analytics.topProducts.length}>
        {analytics.topProducts.map(([name, count]) => (
          <tr key={name}>
            <td className="px-4 py-4 font-medium">{name}</td>
            <td className="px-4 py-4">{count}</td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
