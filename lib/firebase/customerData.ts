"use client";

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  type FieldValue,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { firebaseDb } from "@/lib/firebase/client";
import type { AuthUser } from "@/lib/store/authStore";

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
  createdAt?: FieldValue;
  updatedAt?: FieldValue;
};

function customerRef(uid: string) {
  return doc(firebaseDb, "customers", uid);
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
    ...profile,
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

export async function ensureCustomerFromFirebaseUser(
  user: User,
  extras: Omit<CustomerProfile, "uid"> = {},
) {
  const provider = user.phoneNumber ? "otp" : "email";
  return saveCustomerProfile(user.uid, {
    name: user.displayName ?? extras.name,
    email: user.email ?? extras.email,
    phone: user.phoneNumber ?? extras.phone,
    provider,
    ...extras,
  });
}

export function customerToAuthUser(profile: CustomerProfile): AuthUser {
  return {
    uid: profile.uid,
    firstName: profile.firstName,
    lastName: profile.lastName,
    name: profile.name,
    email: profile.email ?? profile.checkoutEmail,
    phone: profile.phone,
    pincode: profile.pincode,
    provider: profile.provider,
  };
}
