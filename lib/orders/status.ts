export type OrderStatusKey =
  | "placed"
  | "waiting_confirmation"
  | "confirmed"
  | "packed"
  | "picked_up"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "rejected"
  | "refunded";

export const orderTimelineSteps: Array<{
  key: OrderStatusKey;
  label: string;
}> = [
  { key: "placed", label: "Placed" },
  { key: "waiting_confirmation", label: "Waiting for Confirmation" },
  { key: "confirmed", label: "Confirmed" },
  { key: "packed", label: "Packed" },
  { key: "picked_up", label: "Picked Up" },
  { key: "in_transit", label: "In Transit" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

const legacyStatusMap: Record<string, OrderStatusKey> = {
  pending_admin_confirmation: "waiting_confirmation",
  waiting_for_confirmation: "waiting_confirmation",
  shipped: "in_transit",
};

export function normalizeOrderStatus(value?: string | null): OrderStatusKey {
  const status = String(value || "placed").toLowerCase();
  return legacyStatusMap[status] || (status as OrderStatusKey);
}

export function orderStatusLabel(value?: string | null) {
  const status = normalizeOrderStatus(value);
  return (
    orderTimelineSteps.find((step) => step.key === status)?.label ||
    status.replace(/_/g, " ")
  );
}

export function orderStatusIndex(value?: string | null) {
  const status = normalizeOrderStatus(value);
  const index = orderTimelineSteps.findIndex((step) => step.key === status);
  return index === -1 ? 0 : index;
}
