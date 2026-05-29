"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminTable } from "@/components/admin/AdminTable";
import { Header } from "@/components/admin/ProductsAdmin";
import { listCustomers, listOrders } from "@/lib/admin/firestore";
import type { AdminCustomer, AdminOrder } from "@/lib/admin/types";

export function CustomersAdmin() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<AdminCustomer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const [nextCustomers, nextOrders] = await Promise.all([
        listCustomers().catch(() => []),
        listOrders().catch(() => []),
      ]);
      if (!active) return;
      setCustomers(nextCustomers);
      setOrders(nextOrders);
      setLoading(false);
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const needle = query.toLowerCase();
    return customers.filter((customer) =>
      [customer.name, customer.firstName, customer.lastName, customer.email, customer.phone]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle)),
    );
  }, [customers, query]);

  const selectedOrders = orders.filter(
    (order) =>
      selected &&
      (order.userId === selected.id ||
        order.uid === selected.id ||
        order.customerEmail === selected.email ||
        order.email === selected.email),
  );

  return (
    <div className="space-y-6">
      <Header title="Customers" description="View customer profiles, addresses, and order history." />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search name, email, phone"
        className="w-full rounded-md border border-[var(--brand-border)] bg-white px-4 py-3 text-sm md:max-w-sm"
      />
      {loading ? (
        <div className="skeleton h-64 rounded-lg" />
      ) : (
        <AdminTable columns={["Customer", "Email", "Phone", "Pincode"]} empty={!filtered.length}>
          {filtered.map((customer) => (
            <tr
              key={customer.id}
              onClick={() => setSelected(customer)}
              className="cursor-pointer hover:bg-[var(--brand-off-white)]"
            >
              <td className="px-4 py-4 font-medium">
                {customer.name || [customer.firstName, customer.lastName].filter(Boolean).join(" ") || "Customer"}
              </td>
              <td className="px-4 py-4">{customer.email || "-"}</td>
              <td className="px-4 py-4">{customer.phone || "-"}</td>
              <td className="px-4 py-4">{customer.pincode || "-"}</td>
            </tr>
          ))}
        </AdminTable>
      )}
      {selected && (
        <div className="rounded-lg border border-[var(--brand-border)] bg-white p-5">
          <button type="button" onClick={() => setSelected(null)} className="float-right text-sm underline">
            Close
          </button>
          <h2 className="font-display text-3xl font-semibold">
            {selected.name || selected.email || "Customer details"}
          </h2>
          <p className="mt-2 text-sm text-[var(--brand-text-muted)]">
            Saved addresses: {selected.addresses?.length || 0} · Orders: {selectedOrders.length}
          </p>
          <pre className="mt-5 max-h-80 overflow-auto rounded-md bg-[var(--brand-off-white)] p-4 text-xs">
            {JSON.stringify({ customer: selected, orders: selectedOrders }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
