"use client";

import {
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  writeBatch,
  type FieldValue,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { firebaseDb } from "@/lib/firebase/client";
import type { AuthUser } from "@/lib/store/authStore";
import type { CartItem } from "@/lib/types";
import type { SkinAnalysisRecord } from "@/lib/skin-analysis/recommendations";

export type CustomerAddress = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
};

export type CustomerProfile = {
  uid: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  pincode?: string;
  provider?: AuthUser["provider"];
  checkoutEmail?: string;
  addresses?: CustomerAddress[];
  marketingOptIn?: boolean;
  skinAnalysis?: {
    latest?: SkinAnalysisRecord;
    history?: SkinAnalysisRecord[];
  };
  createdAt?: FieldValue;
  updatedAt?: FieldValue;
};

function customerRef(uid: string) {
  return doc(firebaseDb, "customers", uid);
}

export function providerFromFirebaseUser(user: User): AuthUser["provider"] {
  if (user.phoneNumber) return "otp";
  const providerIds = user.providerData.map((provider) => provider.providerId);
  if (providerIds.includes("google.com")) return "google";
  if (providerIds.includes("facebook.com")) return "facebook";
  return "email";
}

function withoutEmpty<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined && entry !== ""),
  ) as Partial<T>;
}

export async function readCustomerProfile(uid?: string | null) {
  if (!uid) return null;
  const snapshot = await getDoc(customerRef(uid));
  if (!snapshot.exists()) return null;
  return snapshot.data() as CustomerProfile;
}

export async function saveCustomerProfile(uid: string, profile: Omit<CustomerProfile, "uid">) {
  const existing = await readCustomerProfile(uid);
  const next = {
    ...withoutEmpty(profile),
    uid,
    createdAt: existing?.createdAt ?? serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(customerRef(uid), next, { merge: true });
  return { ...existing, ...next } as CustomerProfile;
}

export async function saveCustomerAddresses(uid: string, addresses: CustomerAddress[]) {
  await saveCustomerProfile(uid, { addresses: addresses.slice(0, 2) });
}

export async function saveCustomerCheckoutEmail(uid: string, checkoutEmail: string) {
  await saveCustomerProfile(uid, { checkoutEmail });
}

export async function createPendingOrder({
  uid,
  items,
  checkoutEmail,
  address,
  subtotal,
}: {
  uid: string;
  items: CartItem[];
  checkoutEmail: string;
  address: CustomerAddress;
  subtotal: number;
}) {
  const order = {
    uid,
    items,
    checkoutEmail,
    shippingAddress: address,
    subtotal,
    currency: "INR",
    status: "pending_payment",
    paymentStatus: "not_connected",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const rootRef = doc(collection(firebaseDb, "orders"));
  const batch = writeBatch(firebaseDb);
  batch.set(rootRef, {
    ...order,
    id: rootRef.id,
    orderId: rootRef.id,
  });
  batch.set(doc(firebaseDb, "customers", uid, "orders", rootRef.id), {
    ...order,
    id: rootRef.id,
    orderId: rootRef.id,
  });
  await batch.commit();
  return rootRef.id;
}

export async function ensureCustomerFromFirebaseUser(
  user: User,
  extras: Omit<CustomerProfile, "uid"> = {},
) {
  const provider = extras.provider ?? providerFromFirebaseUser(user);
  const existing = await readCustomerProfile(user.uid);
  return saveCustomerProfile(user.uid, {
    name: user.displayName ?? extras.name ?? existing?.name,
    email: user.email ?? extras.email ?? existing?.email,
    phone: user.phoneNumber ?? extras.phone ?? existing?.phone,
    provider,
    ...extras,
  });
}

export function customerToAuthUser(profile: CustomerProfile): AuthUser {
  return {
    uid: profile.uid,
    firstName: profile.firstName,
    lastName: profile.lastName,
    name:
      profile.name ||
      [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
      profile.email,
    email: profile.email ?? profile.checkoutEmail,
    phone: profile.phone,
    pincode: profile.pincode,
    provider: profile.provider || "email",
  };
}
