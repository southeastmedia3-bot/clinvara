import {
  allProducts,
  bestSellerIds,
  getProductBySlug as getStaticProductBySlug,
} from "@/lib/data/products";
import { reviews as staticReviews } from "@/lib/data/reviews";
import type { Product, Review } from "@/lib/types";
import type { StoreSettings } from "@/lib/admin/types";
import { defaultStoreSettings } from "@/lib/data/settings";
import { canonicalProductName } from "@/lib/data/productBranding";

type FirestoreValue = {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  timestampValue?: string;
  arrayValue?: { values?: FirestoreValue[] };
  mapValue?: { fields?: Record<string, FirestoreValue> };
  nullValue?: null;
};

type FirestoreDocument = {
  name: string;
  fields?: Record<string, FirestoreValue>;
};

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "clinvara-f6235";
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "";
const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

function endpoint(path: string) {
  const suffix = apiKey ? `?key=${encodeURIComponent(apiKey)}` : "";
  return `${baseUrl}/${path}${suffix}`;
}

function documentId(name: string) {
  return decodeURIComponent(name.split("/").pop() || "");
}

function readValue(value?: FirestoreValue): unknown {
  if (!value) return undefined;
  if ("stringValue" in value) return value.stringValue || "";
  if ("integerValue" in value) return Number(value.integerValue || 0);
  if ("doubleValue" in value) return Number(value.doubleValue || 0);
  if ("booleanValue" in value) return Boolean(value.booleanValue);
  if ("timestampValue" in value) return value.timestampValue;
  if ("arrayValue" in value) return (value.arrayValue?.values || []).map(readValue);
  if ("mapValue" in value) {
    return Object.fromEntries(
      Object.entries(value.mapValue?.fields || {}).map(([key, entry]) => [
        key,
        readValue(entry),
      ]),
    );
  }
  return undefined;
}

function readFields(fields: Record<string, FirestoreValue> = {}) {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, readValue(value)]),
  ) as Record<string, unknown>;
}

function stringArray(value: unknown, fallback: string[] = []) {
  return Array.isArray(value)
    ? value.map((item) => String(item)).filter(Boolean)
    : fallback;
}

function keyIngredients(value: unknown, fallback?: Product["keyIngredients"]) {
  if (!Array.isArray(value)) return fallback || [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const entry = item as Record<string, unknown>;
      return {
        name: String(entry.name || ""),
        benefit: String(entry.benefit || ""),
      };
    })
    .filter((item): item is { name: string; benefit: string } =>
      Boolean(item?.name && item.benefit),
    );
}

function normalizeProduct(doc: FirestoreDocument): Product {
  const id = documentId(doc.name);
  const data = readFields(doc.fields);
  const fallback =
    getStaticProductBySlug(String(data.slug || "")) ||
    allProducts.find((product) => product.id === String(data.id || id));

  const slug = String(data.slug || fallback?.slug || id);
  const concerns = stringArray(data.concerns, fallback?.concerns || []);
  const image = String(data.image ?? fallback?.image ?? "");
  const galleryFallback = fallback?.gallery?.length
    ? fallback.gallery
    : image
      ? [image]
      : [];
  const gallery = stringArray(data.gallery, galleryFallback).filter(Boolean);

  return {
    id: String(data.id || fallback?.id || id),
    name: canonicalProductName(
      slug,
      String(data.name || fallback?.name || "CLINVARA Product"),
    ),
    concern: String(data.concern || concerns.join(" · ") || fallback?.concern || ""),
    concerns,
    concernSlugs: stringArray(data.concernSlugs, fallback?.concernSlugs || []),
    price: Number(data.price ?? fallback?.price ?? 0),
    mrp: Number(data.mrp ?? fallback?.mrp ?? data.price ?? 0),
    sizes: stringArray(data.sizes, fallback?.sizes || ["30ml"]),
    image,
    imageHover: String(data.imageHover || fallback?.imageHover || image),
    slug,
    badge: String(data.badge ?? fallback?.badge ?? ""),
    rating: Number(data.rating ?? fallback?.rating ?? 0),
    reviewCount: Number(data.reviewCount ?? fallback?.reviewCount ?? 0),
    category: String(data.category || fallback?.category || "serums"),
    description: String(data.description || fallback?.description || ""),
    ingredients: String(data.ingredients || fallback?.ingredients || ""),
    keyIngredients: keyIngredients(data.keyIngredients, fallback?.keyIngredients),
    howToUse: String(data.howToUse || fallback?.howToUse || ""),
    gallery,
    galleryAlt: stringArray(data.galleryAlt, fallback?.galleryAlt || []),
    stock: Number(data.stock ?? fallback?.stock ?? 0),
    availability: String(
      data.availability || fallback?.availability || "in_stock",
    ) as Product["availability"],
    lowStockThreshold: Number(data.lowStockThreshold ?? fallback?.lowStockThreshold ?? 5),
    featured: Boolean(data.featured ?? fallback?.featured ?? false),
    active: data.active === undefined ? fallback?.active ?? true : Boolean(data.active),
    seoTitle: String(data.seoTitle || fallback?.seoTitle || ""),
    seoDescription: String(data.seoDescription || fallback?.seoDescription || ""),
    dispatchTimeDays: Number(data.dispatchTimeDays ?? fallback?.dispatchTimeDays ?? 1),
  };
}

function dedupeProducts(products: Product[]) {
  const bySlug = new Map<string, Product>();

  for (const product of products) {
    const key = product.slug || product.id;
    const existing = bySlug.get(key);

    if (!existing) {
      bySlug.set(key, product);
      continue;
    }

    const existingScore =
      Number(existing.active !== false) +
      Number(existing.stock || 0) +
      Number(existing.featured || existing.badge?.toUpperCase() === "BESTSELLER");
    const nextScore =
      Number(product.active !== false) +
      Number(product.stock || 0) +
      Number(product.featured || product.badge?.toUpperCase() === "BESTSELLER");

    if (nextScore >= existingScore) {
      bySlug.set(key, product);
    }
  }

  return Array.from(bySlug.values());
}

async function readCollection(path: string) {
  const response = await fetch(endpoint(path), {
    next: { revalidate: 120 },
  });
  if (!response.ok) throw new Error(`Firestore ${path} read failed`);
  const data = (await response.json()) as { documents?: FirestoreDocument[] };
  return data.documents || [];
}

export async function getStorefrontProducts() {
  try {
    const docs = await readCollection("products");
    const products = dedupeProducts(
      [
        ...allProducts,
        ...docs.map(normalizeProduct),
      ].filter((product) => product.active !== false),
    );
    return products.length ? products : allProducts;
  } catch {
    return allProducts;
  }
}

export async function getStorefrontProductBySlug(slug: string) {
  const products = await getStorefrontProducts();
  return products.find((product) => product.slug === slug) || getStaticProductBySlug(slug);
}

export async function getStorefrontBestSellers() {
  const products = await getStorefrontProducts();
  const bestSellers = products.filter(
    (product) => product.featured || product.badge?.toUpperCase() === "BESTSELLER",
  );
  if (bestSellers.length) return bestSellers.slice(0, 4);
  return bestSellerIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product))
    .slice(0, 4);
}

export async function getRelatedProducts(product: Product) {
  const products = await getStorefrontProducts();
  return products
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 4);
}

function normalizeReview(doc: FirestoreDocument): Review & { status?: string } {
  const data = readFields(doc.fields);
  return {
    name: String(data.customerName || data.name || "CLINVARA Customer"),
    verified: Boolean(data.verified ?? true),
    date: String(data.date || data.createdAt || ""),
    rating: Number(data.rating || 5),
    title: String(data.title || "Customer review"),
    body: String(data.body || ""),
    productName: String(data.productName || ""),
    productSlug: String(data.productSlug || ""),
    status: String(data.status || "pending"),
  };
}

export async function getApprovedReviews(productSlug?: string) {
  try {
    const docs = await readCollection("reviews");
    const reviews = docs
      .map(normalizeReview)
      .filter((review) => review.status === "approved")
      .filter((review) => !productSlug || review.productSlug === productSlug);
    return reviews.length
      ? reviews
      : staticReviews.filter((review) => !productSlug || review.productSlug === productSlug);
  } catch {
    return staticReviews.filter((review) => !productSlug || review.productSlug === productSlug);
  }
}

export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const response = await fetch(endpoint("settings/store"), {
      next: { revalidate: 120 },
    });
    if (!response.ok) return defaultStoreSettings;
    const data = (await response.json()) as FirestoreDocument;
    return { ...defaultStoreSettings, ...readFields(data.fields), id: "store" } as StoreSettings;
  } catch {
    return defaultStoreSettings;
  }
}
