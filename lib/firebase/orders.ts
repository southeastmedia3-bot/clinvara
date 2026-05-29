import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { firebaseDb } from "@/lib/firebase/client";
import type { CartItem } from "@/lib/types";

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
  const orderRef = await addDoc(
    collection(firebaseDb, "orders"),
    {
      ...payload,

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

  return orderRef.id;
}
