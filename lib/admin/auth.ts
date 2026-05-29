"use client";

import { doc, getDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { firebaseDb } from "@/lib/firebase/client";

function allowedAdminEmails() {
  return (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function isApprovedAdmin(user: User | null) {
  if (!user) return false;

  const email = user.email?.toLowerCase();
  if (email && allowedAdminEmails().includes(email)) return true;

  const userSnapshot = await getDoc(doc(firebaseDb, "users", user.uid));
  if (userSnapshot.exists() && userSnapshot.data().role === "admin") {
    return true;
  }

  const customerSnapshot = await getDoc(doc(firebaseDb, "customers", user.uid));
  return customerSnapshot.exists() && customerSnapshot.data().role === "admin";
}
