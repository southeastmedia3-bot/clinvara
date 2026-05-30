import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { firebaseDb } from "@/lib/firebase/client";
import type { CartItem } from "@/lib/types";

function createPublicOrderId() {
  const code =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase()
      : Math.random().toString(36).slice(2, 8).toUpperCase();
  return `CLV-${code}`;
}

export type CreateOrderPayload = {
  userId: string;
  email: string;
  items: CartItem[];
  subtotal: number;

  shippingAddress: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
};

export async function createOrder(payload: CreateOrderPayload) {
  const publicOrderId = createPublicOrderId();
  const orderRef = await addDoc(
    collection(firebaseDb, "orders"),
    {
      ...payload,
      publicOrderId,

      status: "pending_admin_confirmation",
      orderStatus: "pending_admin_confirmation",
      adminDecision: "pending",
      publicOrderStatus: "waiting_for_confirmation",

      paymentStatus: "pending",

      currency: "INR",

      createdAt: serverTimestamp(),

      updatedAt: serverTimestamp(),
    },
  );

  return { internalOrderId: orderRef.id, publicOrderId };
}
