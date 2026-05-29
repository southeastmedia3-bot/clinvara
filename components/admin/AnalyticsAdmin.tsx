"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, Package, ReceiptText, TrendingUp, Users } from "lucide-react";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminTable } from "@/components/admin/AdminTable";
import { Header } from "@/components/admin/ProductsAdmin";
import { listCustomers, listOrders, listProducts } from "@/lib/admin/firestore";
import type { AdminCustomer, AdminOrder, AdminProduct } from "@/lib/admin/types";

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function AnalyticsAdmin() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);

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
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  const revenue = orders.reduce(
    (sum, order) => sum + Number(order.totalAmount ?? order.subtotal ?? 0),
    0,
  );
  const lowStock = products.filter(
    (product) => Number(product.stock ?? 0) <= Number(product.lowStockThreshold ?? 5),
  ).length;
  const topProducts = useMemo(() => {
    const counts = new Map<string, number>();
    orders.forEach((order) => {
      const items = Array.isArray(order.items) ? order.items : [];
      items.forEach((item) => {
        const name =
          typeof item === "object" && item && "name" in item
            ? String((item as { name?: string }).name)
            : "Product";
        counts.set(name, (counts.get(name) || 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [orders]);

  return (
    <div className="space-y-6">
      <Header title="Analytics" description="Internal store summary based on Firestore data." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <AdminStatCard label="Revenue" value={money(revenue)} icon={TrendingUp} />
        <AdminStatCard label="Orders" value={orders.length} icon={ReceiptText} />
        <AdminStatCard label="Products" value={products.length} icon={Package} />
        <AdminStatCard label="Customers" value={customers.length} icon={Users} />
        <AdminStatCard label="Low stock" value={lowStock} icon={BarChart3} />
      </div>
      <AdminTable columns={["Top product", "Order lines"]} empty={!topProducts.length}>
        {topProducts.map(([name, count]) => (
          <tr key={name}>
            <td className="px-4 py-4 font-medium">{name}</td>
            <td className="px-4 py-4">{count}</td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
