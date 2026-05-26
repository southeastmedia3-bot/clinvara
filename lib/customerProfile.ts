"use client";

import type { AuthUser } from "@/lib/store/authStore";

export type MobileCustomerProfile = {
  name: string;
  pincode: string;
  phone: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
};

const mobileProfilePrefix = "clinvara-mobile-profile:";
export const checkoutEmailKey = "clinvara-checkout-email";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function mobileProfileKey(phone: string) {
  return `${mobileProfilePrefix}${phone}`;
}

export function readMobileProfile(phone?: string | null) {
  if (!phone || !canUseStorage()) return null;
  const saved = window.localStorage.getItem(mobileProfileKey(phone));
  if (!saved) return null;
  try {
    return JSON.parse(saved) as MobileCustomerProfile;
  } catch {
    return null;
  }
}

export function saveMobileProfile(profile: Omit<MobileCustomerProfile, "createdAt" | "updatedAt">) {
  if (!canUseStorage()) return null;
  const existing = readMobileProfile(profile.phone);
  const now = new Date().toISOString();
  const next: MobileCustomerProfile = {
    ...existing,
    ...profile,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  window.localStorage.setItem(mobileProfileKey(profile.phone), JSON.stringify(next));
  return next;
}

export function profileToAuthUser(profile: MobileCustomerProfile): AuthUser {
  return {
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    pincode: profile.pincode,
    provider: "otp",
  };
}

export function readCheckoutEmail(user?: AuthUser | null) {
  if (user?.email) return user.email;
  if (!canUseStorage()) return "";
  return window.localStorage.getItem(checkoutEmailKey) ?? "";
}
