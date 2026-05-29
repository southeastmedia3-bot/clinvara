"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase/client";
import { allProducts } from "@/lib/data/products";
import type {
  AdminCoupon,
  AdminCustomer,
  AdminOrder,
  AdminProduct,
  AdminReview,
  StoreSettings,
} from "@/lib/admin/types";
import { defaultStoreSettings } from "@/lib/data/settings";

function docId(slugOrId: string) {
  return slugOrId.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-");
}

function withId<T>(id: string, data: T) {
  return { id, ...(data as Record<string, unknown>) } as T & { id: string };
}

export const defaultSettings: StoreSettings = defaultStoreSettings;

export async function listProducts(): Promise<AdminProduct[]> {
  const snapshot = await getDocs(collection(firebaseDb, "products"));
  const firestoreProducts = snapshot.docs.map((entry) =>
    withId(entry.id, entry.data()),
  ) as AdminProduct[];

  if (!firestoreProducts.length) {
    return allProducts.map((product) => ({
      ...product,
      stock: 0,
      availability: "out_of_stock",
      lowStockThreshold: 5,
      seoTitle: `${product.name} | CLINVARA`,
      seoDescription: product.description,
    }));
  }

  return firestoreProducts;
}

export async function saveProduct(product: AdminProduct) {
  const id = docId(product.id || product.slug || product.name);
  await setDoc(
    doc(firebaseDb, "products", id),
    {
      ...product,
      id,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function deleteProduct(id: string) {
  await deleteDoc(doc(firebaseDb, "products", id));
}

export async function listOrders(): Promise<AdminOrder[]> {
  const snapshot = await getDocs(
    query(collection(firebaseDb, "orders"), orderBy("createdAt", "desc"), limit(100)),
  ).catch(() => getDocs(collection(firebaseDb, "orders")));
  return snapshot.docs.map((entry) => withId(entry.id, entry.data())) as AdminOrder[];
}

export async function updateOrder(id: string, data: Partial<AdminOrder>) {
  await updateDoc(doc(firebaseDb, "orders", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function listCustomers(): Promise<AdminCustomer[]> {
  const snapshot = await getDocs(collection(firebaseDb, "customers"));
  return snapshot.docs.map((entry) => withId(entry.id, entry.data())) as AdminCustomer[];
}

export async function listCoupons(): Promise<AdminCoupon[]> {
  const snapshot = await getDocs(collection(firebaseDb, "coupons"));
  return snapshot.docs.map((entry) => withId(entry.id, entry.data())) as AdminCoupon[];
}

export async function saveCoupon(coupon: AdminCoupon) {
  const id = docId(coupon.id || coupon.code);
  await setDoc(
    doc(firebaseDb, "coupons", id),
    {
      ...coupon,
      id,
      code: coupon.code.toUpperCase(),
      updatedAt: serverTimestamp(),
      createdAt: coupon.createdAt ?? serverTimestamp(),
    },
    { merge: true },
  );
}

export async function deleteCoupon(id: string) {
  await deleteDoc(doc(firebaseDb, "coupons", id));
}

export async function listReviews(): Promise<AdminReview[]> {
  const snapshot = await getDocs(collection(firebaseDb, "reviews"));
  return snapshot.docs.map((entry) => withId(entry.id, entry.data())) as AdminReview[];
}

export async function updateReview(id: string, data: Partial<AdminReview>) {
  await updateDoc(doc(firebaseDb, "reviews", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteReview(id: string) {
  await deleteDoc(doc(firebaseDb, "reviews", id));
}

export async function readSettings(): Promise<StoreSettings> {
  const snapshot = await getDocs(collection(firebaseDb, "settings"));
  const first = snapshot.docs[0];
  if (!first) return defaultSettings;
  return { ...defaultSettings, ...first.data(), id: first.id } as StoreSettings;
}

export async function saveSettings(settings: StoreSettings) {
  await setDoc(
    doc(firebaseDb, "settings", settings.id || "store"),
    {
      ...settings,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function createCouponDraft(): Promise<AdminCoupon> {
  const ref = await addDoc(collection(firebaseDb, "coupons"), {
    code: "NEWCOUPON",
    discountType: "percentage",
    discountValue: 10,
    minimumOrderValue: 0,
    expiryDate: "",
    usageLimit: 100,
    active: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: ref.id,
    code: "NEWCOUPON",
    discountType: "percentage",
    discountValue: 10,
    minimumOrderValue: 0,
    expiryDate: "",
    usageLimit: 100,
    active: false,
  };
}
