"use client";

import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase/client";
import type { ReturnReason, ReturnStatus } from "@/lib/returns/status";

export type CustomerReturnRequest = {
  id: string;
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  orderId: string;
  orderDisplayId?: string;
  productId?: string;
  productSlug?: string;
  productName: string;
  reason: ReturnReason;
  notes?: string;
  status: ReturnStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type CreateReturnRequestPayload = {
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  orderId: string;
  orderDisplayId?: string;
  productId?: string;
  productSlug?: string;
  productName: string;
  reason: ReturnReason;
  notes?: string;
};

function withId<T>(id: string, data: T) {
  return { id, ...(data as Record<string, unknown>) } as T & { id: string };
}

export async function createReturnRequest(payload: CreateReturnRequestPayload) {
  const ref = await addDoc(collection(firebaseDb, "returns"), {
    ...payload,
    status: "requested",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function listCustomerReturns(customerId: string) {
  const snapshot = await getDocs(
    query(collection(firebaseDb, "returns"), where("customerId", "==", customerId)),
  );

  return snapshot.docs.map((entry) =>
    withId(entry.id, entry.data()),
  ) as CustomerReturnRequest[];
}
