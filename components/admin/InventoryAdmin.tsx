"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  IndianRupee,
  Package,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminTable } from "@/components/admin/AdminTable";
import { Header } from "@/components/admin/ProductsAdmin";
import { listOrders, listProducts, listReviews, saveProduct } from "@/lib/admin/firestore";
import type { AdminOrder, AdminProduct, AdminReview, StockStatus } from "@/lib/admin/types";

type SalesRow = {
  product: AdminProduct;
  unitsSold: number;
  revenue: number;
  lastOrderAt: number;
  reviewCount: number;
  averageRating: number;
  inventoryValue: number;
};

type OrderLine = {
  key: string;
  name: string;
  quantity: number;
  price: number;
};

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function numberValue(value: unknown, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function stockOf(product: AdminProduct) {
  return Math.max(0, Math.floor(numberValue(product.stock, 0)));
}

function thresholdOf(product: AdminProduct) {
  return Math.max(1, Math.floor(numberValue(product.lowStockThreshold, 10)));
}

function priceOf(product: AdminProduct) {
  return Math.max(0, numberValue(product.price, 0));
}

function timestampMs(value: unknown) {
  if (!value) return 0;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "object" && value && "seconds" in value) {
    return numberValue((value as { seconds?: number }).seconds, 0) * 1000;
  }
  if (typeof value === "object" && value && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate().getTime();
  }
  return 0;
}

function formatDate(value: number) {
  if (!value) return "No sale yet";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function monthLabel(value: number) {
  const date = value ? new Date(value) : new Date();
  return new Intl.DateTimeFormat("en-IN", { month: "short", year: "2-digit" }).format(date);
}

function productKeys(product: AdminProduct) {
  return [
    product.id,
    product.slug,
    product.name,
    product.name?.toLowerCase(),
    product.slug?.toLowerCase(),
  ].filter(Boolean) as string[];
}

function normalizeLine(item: unknown): OrderLine | null {
  if (!item || typeof item !== "object") return null;
  const record = item as Record<string, unknown>;
  const name = String(record.name || record.productName || record.title || "Product");
  const key = String(
    record.productId ||
      record.id ||
      record.slug ||
      record.productSlug ||
      record.sku ||
      name,
  ).toLowerCase();
  const quantity = Math.max(1, Math.floor(numberValue(record.quantity, 1)));
  const price = Math.max(0, numberValue(record.price ?? record.salePrice ?? record.amount, 0));
  return { key, name, quantity, price };
}

function orderLines(order: AdminOrder) {
  const source = Array.isArray(order.items)
    ? order.items
    : Array.isArray(order.products)
      ? order.products
      : [];
  return source.map(normalizeLine).filter(Boolean) as OrderLine[];
}

function orderDate(order: AdminOrder) {
  return (
    timestampMs(order.createdAt) ||
    timestampMs(order.confirmedAt) ||
    timestampMs(order.updatedAt)
  );
}

function reviewRating(review: AdminReview) {
  const rating = numberValue(review.rating, 0);
  return rating > 0 ? Math.min(5, rating) : 0;
}

function alertLevel(stock: number) {
  if (stock <= 5) return "critical";
  if (stock <= 10) return "warning";
  return "healthy";
}

function AlertBadge({ stock }: { stock: number }) {
  const level = alertLevel(stock);
  const classes = {
    critical: "border-red-200 bg-red-50 text-red-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    healthy: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };
  const label = level === "critical" ? "Critical" : level === "warning" ? "Warning" : "Healthy";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${classes[level]}`}
    >
      {label}
    </span>
  );
}

function MiniBars({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: Array<{ label: string; value: number; display?: string }>;
  empty?: string;
}) {
  const max = Math.max(1, ...rows.map((row) => row.value));

  return (
    <section className="rounded-lg border border-[var(--brand-border)] bg-white p-5">
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      {rows.length ? (
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
      ) : (
        <p className="mt-5 text-sm text-[var(--brand-text-muted)]">
          {empty || "No trend data available yet."}
        </p>
      )}
    </section>
  );
}

export function InventoryAdmin() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [status, setStatus] = useState("all");
  const [topLimit, setTopLimit] = useState(5);
  const [savingId, setSavingId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const [nextProducts, nextOrders, nextReviews] = await Promise.all([
        listProducts().catch(() => []),
        listOrders().catch(() => []),
        listReviews().catch(() => []),
      ]);
      if (!active) return;
      setProducts(nextProducts);
      setOrders(nextOrders);
      setReviews(nextReviews);
      setLoading(false);
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  const analytics = useMemo(() => {
    const productKeyMap = new Map<string, AdminProduct>();
    products.forEach((product) => {
      productKeys(product).forEach((key) => productKeyMap.set(key.toLowerCase(), product));
    });

    const sales = new Map<string, { unitsSold: number; revenue: number; lastOrderAt: number }>();
    const monthlyUnits = new Map<string, number>();

    orders.forEach((order) => {
      const placedAt = orderDate(order);
      const label = placedAt ? monthLabel(placedAt) : "";
      orderLines(order).forEach((line) => {
        const matched = productKeyMap.get(line.key) || productKeyMap.get(line.name.toLowerCase());
        if (!matched) return;
        const id = matched.id;
        const current = sales.get(id) || { unitsSold: 0, revenue: 0, lastOrderAt: 0 };
        const fallbackPrice = priceOf(matched);
        const lineRevenue = (line.price || fallbackPrice) * line.quantity;
        sales.set(id, {
          unitsSold: current.unitsSold + line.quantity,
          revenue: current.revenue + lineRevenue,
          lastOrderAt: Math.max(current.lastOrderAt, placedAt),
        });
        if (label) monthlyUnits.set(label, (monthlyUnits.get(label) || 0) + line.quantity);
      });
    });

    const productReviews = new Map<string, { count: number; totalRating: number }>();
    reviews.forEach((review) => {
      const rating = reviewRating(review);
      if (!rating) return;
      const key = String(review.productSlug || review.productName || "").toLowerCase();
      const matched = productKeyMap.get(key);
      if (!matched) return;
      const current = productReviews.get(matched.id) || { count: 0, totalRating: 0 };
      productReviews.set(matched.id, {
        count: current.count + 1,
        totalRating: current.totalRating + rating,
      });
    });

    const rows: SalesRow[] = products.map((product) => {
      const productSales = sales.get(product.id) || { unitsSold: 0, revenue: 0, lastOrderAt: 0 };
      const rating = productReviews.get(product.id) || { count: 0, totalRating: 0 };
      const currentStock = stockOf(product);
      return {
        product,
        unitsSold: productSales.unitsSold,
        revenue: productSales.revenue,
        lastOrderAt: productSales.lastOrderAt,
        reviewCount: rating.count,
        averageRating: rating.count ? rating.totalRating / rating.count : 0,
        inventoryValue: currentStock * priceOf(product),
      };
    });

    const totalUnits = products.reduce((sum, product) => sum + stockOf(product), 0);
    const totalValue = rows.reduce((sum, row) => sum + row.inventoryValue, 0);
    const outOfStock = products.filter((product) => stockOf(product) <= 0).length;
    const lowStock = products.filter((product) => {
      const stock = stockOf(product);
      return stock > 0 && stock <= thresholdOf(product);
    }).length;
    const healthy = products.filter((product) => stockOf(product) >= 11).length;
    const highestValue = [...rows].sort((a, b) => b.inventoryValue - a.inventoryValue)[0];
    const lowestValue = [...rows].sort((a, b) => a.inventoryValue - b.inventoryValue)[0];
    const fastest = [...rows].sort((a, b) => b.unitsSold - a.unitsSold || b.revenue - a.revenue);
    const slowest = [...rows].sort(
      (a, b) => a.unitsSold - b.unitsSold || a.lastOrderAt - b.lastOrderAt,
    );
    const monthRows = Array.from(monthlyUnits.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([label, value]) => ({ label, value, display: `${value} units` }));
    const demandRows = fastest
      .filter((row) => row.unitsSold > 0)
      .slice(0, 6)
      .map((row) => ({
        label: row.product.name,
        value: row.unitsSold,
        display: `${row.unitsSold} units`,
      }));

    return {
      rows,
      totalUnits,
      totalValue,
      outOfStock,
      lowStock,
      healthy,
      highestValue,
      lowestValue,
      fastest,
      slowest,
      monthRows,
      demandRows,
    };
  }, [orders, products, reviews]);

  const filtered = useMemo(() => {
    if (status === "all") return products;
    return products.filter((product) => {
      const stock = stockOf(product);
      if (status === "critical") return alertLevel(stock) === "critical";
      if (status === "warning") return alertLevel(stock) === "warning";
      if (status === "healthy") return alertLevel(stock) === "healthy";
      return (product.availability || "out_of_stock") === status;
    });
  }, [products, status]);

  async function update(product: AdminProduct, patch: Partial<AdminProduct>) {
    const next = { ...product, ...patch };
    setProducts((current) => current.map((item) => (item.id === product.id ? next : item)));
    setSavingId(product.id);
    try {
      await saveProduct(next);
    } finally {
      setSavingId("");
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-12 w-72 rounded" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[0, 1, 2, 3, 4].map((item) => (
            <div key={item} className="skeleton h-36 rounded-lg" />
          ))}
        </div>
        <div className="skeleton h-72 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Header
        title="Inventory Intelligence"
        description="Stock alerts, product movement, inventory value, and product performance from Firestore products, orders, and reviews."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <AdminStatCard label="Total Products" value={products.length} icon={Package} />
        <AdminStatCard
          label="Total Inventory Units"
          value={analytics.totalUnits}
          detail="Current sellable stock."
          icon={BarChart3}
        />
        <AdminStatCard
          label="Inventory Value"
          value={money(analytics.totalValue)}
          detail="Stock multiplied by product price."
          icon={IndianRupee}
        />
        <AdminStatCard
          label="Low Stock Alerts"
          value={analytics.lowStock}
          detail="Products at or below threshold."
          icon={AlertTriangle}
        />
        <AdminStatCard
          label="Out Of Stock"
          value={analytics.outOfStock}
          detail="Products with zero stock."
          icon={XCircle}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <AdminStatCard
          label="Low Stock Products"
          value={analytics.lowStock}
          detail="Warning and critical stock requiring action."
          icon={AlertTriangle}
        />
        <AdminStatCard
          label="Out Of Stock Products"
          value={analytics.outOfStock}
          detail="Products unavailable to replenish."
          icon={XCircle}
        />
        <AdminStatCard
          label="Healthy Products"
          value={analytics.healthy}
          detail="Products with 11 or more units."
          icon={CheckCircle2}
        />
      </section>

      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <h2 className="font-display text-2xl font-semibold">Low Stock Alerts</h2>
            <p className="mt-1 text-sm text-[var(--brand-text-muted)]">
              Critical: 0-5 units, Warning: 6-10 units, Healthy: 11+ units.
            </p>
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-md border border-[var(--brand-border)] bg-white px-4 py-3 text-sm"
          >
            <option value="all">All inventory</option>
            <option value="critical">Critical alerts</option>
            <option value="warning">Warning alerts</option>
            <option value="healthy">Healthy stock</option>
            <option value="in_stock">Marked in stock</option>
            <option value="low_stock">Marked low stock</option>
            <option value="out_of_stock">Marked out of stock</option>
          </select>
        </div>

        <AdminTable columns={["Product", "Current Stock", "Threshold Level", "Alert"]} empty={!filtered.length}>
          {filtered.map((product) => {
            const stock = stockOf(product);
            return (
              <tr key={product.id}>
                <td className="px-4 py-4 font-medium">{product.name}</td>
                <td className="px-4 py-4">{stock}</td>
                <td className="px-4 py-4">{thresholdOf(product)}</td>
                <td className="px-4 py-4">
                  <AlertBadge stock={stock} />
                </td>
              </tr>
            );
          })}
        </AdminTable>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-semibold">Fast Moving Products</h2>
              <p className="text-sm text-[var(--brand-text-muted)]">
                Ranked by units sold from actual order history.
              </p>
            </div>
            <div className="flex rounded-full border border-[var(--brand-border)] bg-white p-1 text-xs font-semibold">
              {[3, 5].map((limit) => (
                <button
                  key={limit}
                  type="button"
                  onClick={() => setTopLimit(limit)}
                  className={`rounded-full px-4 py-2 ${
                    topLimit === limit ? "bg-black text-white" : "text-[var(--brand-text-muted)]"
                  }`}
                >
                  Top {limit}
                </button>
              ))}
            </div>
          </div>
          <AdminTable columns={["Product Name", "Units Sold", "Revenue Generated"]} empty={!analytics.fastest.length}>
            {analytics.fastest.slice(0, topLimit).map((row) => (
              <tr key={row.product.id}>
                <td className="px-4 py-4 font-medium">{row.product.name}</td>
                <td className="px-4 py-4">{row.unitsSold}</td>
                <td className="px-4 py-4">{money(row.revenue)}</td>
              </tr>
            ))}
          </AdminTable>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="font-display text-2xl font-semibold">Slow Moving Products</h2>
            <p className="text-sm text-[var(--brand-text-muted)]">
              Lowest sales volume and longest time without a sale.
            </p>
          </div>
          <AdminTable columns={["Product", "Units Sold", "Last Order Date"]} empty={!analytics.slowest.length}>
            {analytics.slowest.slice(0, 8).map((row) => (
              <tr key={row.product.id}>
                <td className="px-4 py-4 font-medium">{row.product.name}</td>
                <td className="px-4 py-4">{row.unitsSold}</td>
                <td className="px-4 py-4">{formatDate(row.lastOrderAt)}</td>
              </tr>
            ))}
          </AdminTable>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-2xl font-semibold">Inventory Value</h2>
          <p className="text-sm text-[var(--brand-text-muted)]">
            Current stock multiplied by storefront price.
          </p>
        </div>
        <section className="grid gap-4 md:grid-cols-3">
          <AdminStatCard
            label="Total Inventory Value"
            value={money(analytics.totalValue)}
            icon={IndianRupee}
          />
          <AdminStatCard
            label="Highest Value Product"
            value={analytics.highestValue?.product.name || "None"}
            detail={analytics.highestValue ? money(analytics.highestValue.inventoryValue) : undefined}
            icon={TrendingUp}
          />
          <AdminStatCard
            label="Lowest Value Product"
            value={analytics.lowestValue?.product.name || "None"}
            detail={analytics.lowestValue ? money(analytics.lowestValue.inventoryValue) : undefined}
            icon={TrendingDown}
          />
        </section>
        <AdminTable columns={["Product", "Current Stock", "Price", "Inventory Value"]} empty={!analytics.rows.length}>
          {[...analytics.rows]
            .sort((a, b) => b.inventoryValue - a.inventoryValue)
            .map((row) => (
              <tr key={row.product.id}>
                <td className="px-4 py-4 font-medium">{row.product.name}</td>
                <td className="px-4 py-4">{stockOf(row.product)}</td>
                <td className="px-4 py-4">{money(priceOf(row.product))}</td>
                <td className="px-4 py-4">{money(row.inventoryValue)}</td>
              </tr>
            ))}
        </AdminTable>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <MiniBars
          title="Stock Consumption Trend"
          rows={analytics.monthRows}
          empty="Order history has not produced stock movement yet."
        />
        <MiniBars
          title="Product Demand Trend"
          rows={analytics.demandRows}
          empty="No product demand can be calculated until orders are placed."
        />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-2xl font-semibold">Product Performance</h2>
          <p className="text-sm text-[var(--brand-text-muted)]">
            Consolidated stock, sales, revenue, and review quality by product.
          </p>
        </div>
        <AdminTable
          columns={[
            "Product",
            "Stock Available",
            "Units Sold",
            "Revenue Generated",
            "Review Count",
            "Average Rating",
            "Alert",
          ]}
          empty={!analytics.rows.length}
        >
          {analytics.rows.map((row) => (
            <tr key={row.product.id}>
              <td className="px-4 py-4 font-medium">{row.product.name}</td>
              <td className="px-4 py-4">{stockOf(row.product)}</td>
              <td className="px-4 py-4">{row.unitsSold}</td>
              <td className="px-4 py-4">{money(row.revenue)}</td>
              <td className="px-4 py-4">{row.reviewCount}</td>
              <td className="px-4 py-4">
                {row.averageRating ? row.averageRating.toFixed(1) : "Not rated"}
              </td>
              <td className="px-4 py-4">
                <AlertBadge stock={stockOf(row.product)} />
              </td>
            </tr>
          ))}
        </AdminTable>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-2xl font-semibold">Stock Controls</h2>
          <p className="text-sm text-[var(--brand-text-muted)]">
            Update product stock, threshold, and customer-facing availability.
          </p>
        </div>
        <AdminTable columns={["Product", "Stock", "Threshold", "Status", "Sync"]} empty={!products.length}>
          {products.map((product) => (
            <tr key={product.id}>
              <td className="px-4 py-4 font-medium">{product.name}</td>
              <td className="px-4 py-4">
                <input
                  type="number"
                  min={0}
                  value={stockOf(product)}
                  onChange={(event) =>
                    void update(product, { stock: Math.max(0, numberValue(event.target.value, 0)) })
                  }
                  className="w-24 rounded-md border border-[var(--brand-border)] px-3 py-2"
                />
              </td>
              <td className="px-4 py-4">
                <input
                  type="number"
                  min={1}
                  value={thresholdOf(product)}
                  onChange={(event) =>
                    void update(product, {
                      lowStockThreshold: Math.max(1, numberValue(event.target.value, 10)),
                    })
                  }
                  className="w-24 rounded-md border border-[var(--brand-border)] px-3 py-2"
                />
              </td>
              <td className="px-4 py-4">
                <select
                  value={product.availability || "out_of_stock"}
                  onChange={(event) =>
                    void update(product, { availability: event.target.value as StockStatus })
                  }
                  className="rounded-md border border-[var(--brand-border)] px-3 py-2"
                >
                  <option value="in_stock">In stock</option>
                  <option value="low_stock">Low stock</option>
                  <option value="out_of_stock">Out of stock</option>
                </select>
              </td>
              <td className="px-4 py-4 text-sm text-[var(--brand-text-muted)]">
                {savingId === product.id ? "Saving..." : "Synced"}
              </td>
            </tr>
          ))}
        </AdminTable>
      </section>
    </div>
  );
}
