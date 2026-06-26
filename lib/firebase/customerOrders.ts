"use client";

import { collection, getDocs, query, where } from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase/client";
import { orderStatusLabel } from "@/lib/orders/status";
import type { CustomerAddress } from "@/lib/firebase/customerData";
import { canonicalProductName } from "@/lib/data/productBranding";

export type CustomerOrderItem = {
  productId?: string;
  slug?: string;
  name?: string;
  quantity?: number;
  size?: string;
  price?: number;
  image?: string;
};

export type CustomerOrderRecord = {
  id: string;
  orderId?: string;
  publicOrderId?: string;
  userId?: string;
  uid?: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  checkoutEmail?: string;
  email?: string;
  subtotal?: number;
  totalAmount?: number;
  status?: string;
  orderStatus?: string;
  publicOrderStatus?: string;
  adminDecision?: "pending" | "accepted" | "rejected";
  paymentStatus?: string;
  paymentMethod?: string;
  rejectionReason?: string;
  items?: CustomerOrderItem[];
  products?: CustomerOrderItem[];
  shippingAddress?: CustomerAddress;
  address?: CustomerAddress;
  createdAt?: { seconds?: number } | string | unknown;
  placedAt?: { seconds?: number } | string | unknown;
};

export type CustomerOrderIdentity = {
  uid?: string;
  email?: string;
};

export function displayOrderId(order: CustomerOrderRecord) {
  return order.publicOrderId || order.orderId || order.id;
}

export function orderItems(order: CustomerOrderRecord) {
  const items = order.items?.length ? order.items : order.products || [];
  return items.map((item) => ({
    ...item,
    name: canonicalProductName(item.slug || item.productId, item.name),
  }));
}

export function orderTimestamp(value: unknown) {
  if (!value) return 0;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (typeof value === "object" && value && "seconds" in value) {
    return Number((value as { seconds?: number }).seconds || 0) * 1000;
  }
  if (typeof value === "object" && value && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate().getTime();
  }
  return 0;
}

export function orderDateLabel(value: unknown) {
  const time = orderTimestamp(value);
  return time ? new Date(time).toLocaleString("en-IN") : "Recently placed";
}

export function customerOrderStatus(order: CustomerOrderRecord) {
  if (order.orderStatus === "cancelled" || order.publicOrderStatus === "cancelled" || order.status === "cancelled") {
    return "Cancelled";
  }
  if (order.adminDecision === "pending") return "Waiting for confirmation";
  if (order.adminDecision === "rejected" || order.orderStatus === "rejected") return "Rejected";
  return orderStatusLabel(order.publicOrderStatus || order.orderStatus || order.status);
}

export function orderBelongsToCustomer(
  order: CustomerOrderRecord,
  customer: CustomerOrderIdentity | null,
) {
  if (!customer?.uid) return false;
  return (
    order.userId === customer.uid ||
    order.uid === customer.uid ||
    order.customerId === customer.uid ||
    Boolean(customer.email && [order.email, order.customerEmail, order.checkoutEmail].includes(customer.email))
  );
}

export async function listCustomerOrders(customer: CustomerOrderIdentity) {
  const currentUserId = customer.uid || "";
  if (!currentUserId) return [];

  const filters: Array<[string, string]> = [["userId", currentUserId]];
  filters.push(["uid", currentUserId], ["customerId", currentUserId]);
  if (customer.email) {
    filters.push(
      ["email", customer.email],
      ["customerEmail", customer.email],
      ["checkoutEmail", customer.email],
    );
  }

  const snapshots = await Promise.all(
    filters.map(([field, value]) =>
      getDocs(query(collection(firebaseDb, "orders"), where(field, "==", value))).catch(
        () => null,
      ),
    ),
  );

  const byId = new Map<string, CustomerOrderRecord>();
  snapshots.forEach((snapshot) => {
    snapshot?.docs.forEach((orderDoc) => {
      byId.set(orderDoc.id, {
        id: orderDoc.id,
        ...(orderDoc.data() as Omit<CustomerOrderRecord, "id">),
      });
    });
  });

  return Array.from(byId.values()).sort((a, b) => {
    const aTime = orderTimestamp(a.placedAt || a.createdAt);
    const bTime = orderTimestamp(b.placedAt || b.createdAt);
    return bTime - aTime;
  });
}
