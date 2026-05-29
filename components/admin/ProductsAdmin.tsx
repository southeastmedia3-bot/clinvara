"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";
import { AdminTable } from "@/components/admin/AdminTable";
import { ProductForm } from "@/components/admin/ProductForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { deleteProduct, listProducts, saveProduct } from "@/lib/admin/firestore";
import type { AdminProduct } from "@/lib/admin/types";

export function ProductsAdmin() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");
  const [pendingDelete, setPendingDelete] = useState<AdminProduct | null>(null);
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
    const needle = query.toLowerCase();
    return products.filter((product) =>
      [product.name, product.slug, product.category, product.badge]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle)),
    );
  }, [products, query]);

  return (
    <div className="space-y-6">
      <Header
        title="Products"
        description="Manage product content, SEO, images, and availability."
        actionLabel="Add product"
        onAction={() => {
          setEditing(null);
          setShowForm(true);
        }}
      />

      {showForm && (
        <ProductForm
          product={editing}
          onCancel={() => setShowForm(false)}
          onSave={async (product) => {
            await saveProduct(product);
            setShowForm(false);
            await refresh();
          }}
        />
      )}

      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search products"
        className="w-full rounded-md border border-[var(--brand-border)] bg-white px-4 py-3 text-sm md:max-w-sm"
      />

      {loading ? (
        <div className="skeleton h-64 rounded-lg" />
      ) : (
        <AdminTable columns={["Product", "Price", "Category", "Stock", "Actions"]} empty={!filtered.length}>
          {filtered.map((product) => (
            <tr key={product.id}>
              <td className="px-4 py-4">
                <div className="font-medium">{product.name}</div>
                <div className="text-xs text-[var(--brand-text-muted)]">{product.slug}</div>
              </td>
              <td className="px-4 py-4">Rs.{product.price}</td>
              <td className="px-4 py-4 capitalize">{product.category}</td>
              <td className="px-4 py-4">{product.stock ?? 0}</td>
              <td className="px-4 py-4">
                <div className="flex gap-2">
                  <IconButton
                    label="Edit product"
                    onClick={() => {
                      setEditing(product);
                      setShowForm(true);
                    }}
                    icon={<Edit className="h-4 w-4" />}
                  />
                  <IconButton
                    label="Delete product"
                    onClick={() => setPendingDelete(product)}
                    icon={<Trash2 className="h-4 w-4" />}
                  />
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete product?"
        message={`This will remove ${pendingDelete?.name || "this product"} from Firestore products. This action should only be used when the product is no longer needed.`}
        confirmLabel="Delete"
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await deleteProduct(pendingDelete.id);
          setPendingDelete(null);
          await refresh();
        }}
      />
    </div>
  );
}

export function Header({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-text-muted)]">
          Admin
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-[var(--brand-text-muted)]">{description}</p>
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white"
        >
          <Plus className="h-4 w-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function IconButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="rounded-full border border-[var(--brand-border)] p-2 hover:border-black"
    >
      {icon}
    </button>
  );
}
