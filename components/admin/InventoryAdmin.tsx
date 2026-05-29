"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminTable } from "@/components/admin/AdminTable";
import { Header } from "@/components/admin/ProductsAdmin";
import { listProducts, saveProduct } from "@/lib/admin/firestore";
import type { AdminProduct, StockStatus } from "@/lib/admin/types";

export function InventoryAdmin() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    setProducts(await listProducts().catch(() => []));
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
  }, []);

  const filtered = useMemo(() => {
    if (status === "all") return products;
    return products.filter((product) => (product.availability || "out_of_stock") === status);
  }, [products, status]);

  async function update(product: AdminProduct, patch: Partial<AdminProduct>) {
    const next = { ...product, ...patch };
    setProducts((current) => current.map((item) => (item.id === product.id ? next : item)));
    await saveProduct(next);
  }

  return (
    <div className="space-y-6">
      <Header title="Inventory" description="Track stock levels and availability." />
      <select
        value={status}
        onChange={(event) => setStatus(event.target.value)}
        className="rounded-md border border-[var(--brand-border)] bg-white px-4 py-3 text-sm"
      >
        <option value="all">All stock statuses</option>
        <option value="in_stock">In stock</option>
        <option value="low_stock">Low stock</option>
        <option value="out_of_stock">Out of stock</option>
      </select>
      {loading ? (
        <div className="skeleton h-64 rounded-lg" />
      ) : (
        <AdminTable columns={["Product", "Stock", "Threshold", "Status"]} empty={!filtered.length}>
          {filtered.map((product) => (
            <tr key={product.id}>
              <td className="px-4 py-4 font-medium">{product.name}</td>
              <td className="px-4 py-4">
                <input
                  type="number"
                  value={product.stock ?? 0}
                  onChange={(event) => void update(product, { stock: Number(event.target.value) })}
                  className="w-24 rounded-md border border-[var(--brand-border)] px-3 py-2"
                />
              </td>
              <td className="px-4 py-4">
                <input
                  type="number"
                  value={product.lowStockThreshold ?? 5}
                  onChange={(event) =>
                    void update(product, { lowStockThreshold: Number(event.target.value) })
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
            </tr>
          ))}
        </AdminTable>
      )}
    </div>
  );
}
