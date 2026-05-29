"use client";

import { useEffect, useState } from "react";
import type { AdminProduct } from "@/lib/admin/types";

const emptyProduct: AdminProduct = {
  id: "",
  name: "",
  slug: "",
  price: 0,
  mrp: 0,
  category: "serums",
  concerns: [],
  concern: "",
  sizes: ["30ml"],
  image: "",
  imageHover: "",
  badge: "",
  rating: 0,
  reviewCount: 0,
  stock: 0,
  availability: "out_of_stock",
  lowStockThreshold: 5,
  description: "",
  ingredients: "",
  howToUse: "",
  gallery: [],
  seoTitle: "",
  seoDescription: "",
  featured: false,
  active: true,
};

function csv(value?: string[]) {
  return value?.join(", ") || "";
}

function splitCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatKeyIngredients(value: AdminProduct["keyIngredients"]) {
  return (value || []).map((item) => `${item.name}: ${item.benefit}`).join("\n");
}

function parseKeyIngredients(value: string) {
  return value
    .split("\n")
    .map((line) => {
      const [name, ...benefit] = line.split(":");
      return { name: name.trim(), benefit: benefit.join(":").trim() };
    })
    .filter((item) => item.name && item.benefit);
}

export function ProductForm({
  product,
  onSave,
  onCancel,
}: {
  product?: AdminProduct | null;
  onSave: (product: AdminProduct) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<AdminProduct>(product || emptyProduct);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(product || emptyProduct);
  }, [product]);

  function update<K extends keyof AdminProduct>(key: K, value: AdminProduct[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    await onSave({
      ...form,
      id: form.id || form.slug,
      concern: form.concerns?.join(" · ") || form.concern,
      gallery: form.gallery?.length ? form.gallery : [form.image].filter(Boolean),
    });
    setSaving(false);
  }

  return (
    <form onSubmit={submit} className="space-y-5 rounded-lg border border-[var(--brand-border)] bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-semibold">
            {product ? "Edit product" : "Add product"}
          </h2>
          <p className="text-sm text-[var(--brand-text-muted)]">
            Changes save to Firestore products.
          </p>
        </div>
        <button type="button" onClick={onCancel} className="text-sm underline">
          Cancel
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name" value={form.name} onChange={(value) => update("name", value)} required />
        <Field label="Slug" value={form.slug} onChange={(value) => update("slug", value)} required />
        <Field label="Price" type="number" value={form.price} onChange={(value) => update("price", Number(value))} />
        <Field label="MRP" type="number" value={form.mrp} onChange={(value) => update("mrp", Number(value))} />
        <Field label="Category" value={form.category} onChange={(value) => update("category", value)} />
        <Field label="Badge" value={form.badge} onChange={(value) => update("badge", value)} />
        <Field label="Stock" type="number" value={form.stock || 0} onChange={(value) => update("stock", Number(value))} />
        <Field label="Low stock threshold" type="number" value={form.lowStockThreshold || 5} onChange={(value) => update("lowStockThreshold", Number(value))} />
        <label className="space-y-2 text-sm">
          <span className="font-medium">Availability</span>
          <select
            value={form.availability || "out_of_stock"}
            onChange={(event) => update("availability", event.target.value as AdminProduct["availability"])}
            className="w-full rounded-md border border-[var(--brand-border)] px-3 py-3"
          >
            <option value="in_stock">In stock</option>
            <option value="low_stock">Low stock</option>
            <option value="out_of_stock">Out of stock</option>
          </select>
        </label>
        <Field label="Concerns, comma separated" value={csv(form.concerns)} onChange={(value) => update("concerns", splitCsv(value))} />
        <Field label="Image URL" value={form.image} onChange={(value) => update("image", value)} />
        <Field label="Hover image URL" value={form.imageHover} onChange={(value) => update("imageHover", value)} />
        <Field label="Gallery URLs, comma separated" value={csv(form.gallery)} onChange={(value) => update("gallery", splitCsv(value))} />
        <Field label="SEO title" value={form.seoTitle || ""} onChange={(value) => update("seoTitle", value)} />
      </div>
      <div className="flex flex-wrap gap-5 text-sm">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.featured || false}
            onChange={(event) => update("featured", event.target.checked)}
          />
          Featured / Best Seller
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.active !== false}
            onChange={(event) => update("active", event.target.checked)}
          />
          Visible on storefront
        </label>
      </div>

      <Textarea label="Description" value={form.description || ""} onChange={(value) => update("description", value)} />
      <Textarea label="Ingredients" value={form.ingredients || ""} onChange={(value) => update("ingredients", value)} />
      <Textarea
        label="Key ingredients, one per line as Name: Benefit"
        value={formatKeyIngredients(form.keyIngredients)}
        onChange={(value) => update("keyIngredients", parseKeyIngredients(value))}
      />
      <Textarea label="How to use" value={form.howToUse || ""} onChange={(value) => update("howToUse", value)} />
      <Textarea label="SEO description" value={form.seoDescription || ""} onChange={(value) => update("seoDescription", value)} />

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-black px-7 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-50"
      >
        {saving ? "Saving" : "Save product"}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="space-y-2 text-sm">
      <span className="font-medium">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-[var(--brand-border)] px-3 py-3"
      />
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-2 text-sm">
      <span className="font-medium">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full rounded-md border border-[var(--brand-border)] px-3 py-3"
      />
    </label>
  );
}
