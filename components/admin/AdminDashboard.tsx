"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Package, ReceiptText, ShoppingBag, Users } from "lucide-react";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminTable } from "@/components/admin/AdminTable";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { listCustomers, listOrders, listProducts } from "@/lib/admin/firestore";
import type { AdminCustomer, AdminOrder, AdminProduct } from "@/lib/admin/types";

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

function orderStatus(order: AdminOrder) {
  return order.orderStatus || order.status || "Pending";
}

export function AdminDashboard() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const [nextOrders, nextProducts, nextCustomers] = await Promise.all([
        listOrders().catch(() => []),
        listProducts().catch(() => []),
        listCustomers().catch(() => []),
      ]);
      if (!active) return;
      setOrders(nextOrders);
      setProducts(nextProducts);
      setCustomers(nextCustomers);
      setLoading(false);
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const pendingOrders = orders.filter((order) =>
      String(orderStatus(order)).toLowerCase().includes("pending"),
    ).length;
    const lowStockProducts = products.filter((product) => {
      const stock = Number(product.stock ?? 0);
      const threshold = Number(product.lowStockThreshold ?? 5);
      return stock > 0 && stock <= threshold;
    }).length;
    return {
      totalOrders: orders.length,
      pendingOrders,
      totalRevenue: orders.reduce((sum, order) => sum + orderTotal(order), 0),
      totalCustomers: customers.length,
      totalProducts: products.length,
      lowStockProducts,
    };
  }, [customers.length, orders, products]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-text-muted)]">
          Operations
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <AdminStatCard label="Total orders" value={stats.totalOrders} icon={ReceiptText} />
        <AdminStatCard label="Pending orders" value={stats.pendingOrders} icon={ShoppingBag} />
        <AdminStatCard label="Total revenue" value={money(stats.totalRevenue)} icon={ShoppingBag} />
        <AdminStatCard label="Total customers" value={stats.totalCustomers} icon={Users} />
        <AdminStatCard label="Total products" value={stats.totalProducts} icon={Package} />
        <AdminStatCard label="Low stock" value={stats.lowStockProducts} icon={AlertTriangle} />
      </div>

      <section className="grid gap-6 xl:grid-cols-2">
        <div>
          <h2 className="mb-4 font-display text-2xl font-semibold">Recent orders</h2>
          <AdminTable columns={["Order", "Customer", "Status", "Total"]} empty={!orders.length}>
            {orders.slice(0, 6).map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-4 font-medium">{order.orderId || order.id}</td>
                <td className="px-4 py-4 text-[var(--brand-text-muted)]">
                  {order.customerName || order.customerEmail || order.email || "Customer"}
                </td>
                <td className="px-4 py-4">
                  <OrderStatusBadge status={String(orderStatus(order))} />
                </td>
                <td className="px-4 py-4">{money(orderTotal(order))}</td>
              </tr>
            ))}
          </AdminTable>
        </div>
        <div>
          <h2 className="mb-4 font-display text-2xl font-semibold">Low stock warning</h2>
          <AdminTable columns={["Product", "Stock", "Status"]} empty={!products.length}>
            {products
              .filter((product) => Number(product.stock ?? 0) <= Number(product.lowStockThreshold ?? 5))
              .slice(0, 6)
              .map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-4 font-medium">{product.name}</td>
                  <td className="px-4 py-4">{product.stock ?? 0}</td>
                  <td className="px-4 py-4 text-[var(--brand-text-muted)]">
                    {product.availability || "out_of_stock"}
                  </td>
                </tr>
              ))}
          </AdminTable>
        </div>
      </section>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="skeleton h-12 w-64 rounded" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="skeleton h-36 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
