export type ReturnStatus =
  | "requested"
  | "approved"
  | "rejected"
  | "received"
  | "refunded";

export const returnStatusSteps: Array<{
  key: ReturnStatus;
  label: string;
}> = [
  { key: "requested", label: "Return Requested" },
  { key: "approved", label: "Approved" },
  { key: "received", label: "Received" },
  { key: "refunded", label: "Refunded" },
];

export const returnReasons = [
  "Damaged Product",
  "Wrong Product Received",
  "Product Defect",
  "Allergic Reaction",
  "Packaging Issue",
  "Other",
] as const;

export type ReturnReason = (typeof returnReasons)[number];

export function normalizeReturnStatus(value?: string | null): ReturnStatus {
  const status = String(value || "requested").toLowerCase();
  if (status === "pending") return "requested";
  if (status === "return_requested") return "requested";
  if (status === "accepted") return "approved";
  if (status === "complete") return "refunded";
  if (
    status === "requested" ||
    status === "approved" ||
    status === "rejected" ||
    status === "received" ||
    status === "refunded"
  ) {
    return status;
  }
  return "requested";
}

export function returnStatusLabel(value?: string | null) {
  const status = normalizeReturnStatus(value);
  if (status === "rejected") return "Rejected";
  return (
    returnStatusSteps.find((step) => step.key === status)?.label ||
    status.replace(/_/g, " ")
  );
}

export function returnStatusIndex(value?: string | null) {
  const status = normalizeReturnStatus(value);
  const index = returnStatusSteps.findIndex((step) => step.key === status);
  return index === -1 ? 0 : index;
}

export function allowedReturnTransitions(status?: string | null): ReturnStatus[] {
  const normalized = normalizeReturnStatus(status);
  if (normalized === "requested") return ["approved", "rejected"];
  if (normalized === "approved") return ["received"];
  if (normalized === "received") return ["refunded"];
  return [];
}
