import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { firebaseDb } from "@/lib/firebase/client";
import type { CartItem } from "@/lib/types";
import { getDeliveryEstimate } from "@/lib/delivery/estimate";

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
  const maxDispatchTime = Math.max(
    1,
    ...payload.items.map((item) => Number(item.dispatchTimeDays ?? 1)),
  );
  const deliveryEstimate = getDeliveryEstimate({
    dispatchTimeDays: maxDispatchTime,
    address: payload.shippingAddress,
  });
  const order = {
    ...payload,
    publicOrderId,

    status: "placed",
    orderStatus: "waiting_confirmation",
    adminDecision: "pending",
    publicOrderStatus: "waiting_confirmation",

    paymentMethod: "Payment pending",
    paymentStatus: "pending",

    currency: "INR",
    dispatchTimeDays: maxDispatchTime,
    deliveryRegion: deliveryEstimate.region,
    estimatedDeliveryStart: deliveryEstimate.startDate,
    estimatedDeliveryEnd: deliveryEstimate.endDate,
    estimatedDeliveryLabel: deliveryEstimate.label,

    placedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const orderRef = await addDoc(
    collection(firebaseDb, "orders"),
    order,
  );

  await setDoc(
    doc(firebaseDb, "customers", payload.userId, "orders", orderRef.id),
    {
      ...order,
      id: orderRef.id,
    },
    { merge: true },
  );

  return { internalOrderId: orderRef.id, publicOrderId };
}
