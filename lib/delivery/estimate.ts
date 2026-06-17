export type DeliveryAddressInput = {
  city?: string;
  state?: string;
  pincode?: string;
};

type DeliveryBand = {
  min: number;
  max: number;
  region: string;
};

const southIndiaStates = new Set([
  "andhra pradesh",
  "karnataka",
  "kerala",
  "tamil nadu",
  "telangana",
  "puducherry",
]);

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function normalizeDispatchDays(value: unknown) {
  const days = Number(value);
  return Number.isFinite(days) && days > 0 ? Math.ceil(days) : 1;
}

export function deliveryBandForAddress(address?: DeliveryAddressInput | null): DeliveryBand {
  const city = address?.city?.trim().toLowerCase() || "";
  const state = address?.state?.trim().toLowerCase() || "";

  if (city === "hyderabad") return { min: 1, max: 2, region: "Hyderabad" };
  if (state === "telangana") return { min: 2, max: 4, region: "Telangana" };
  if (southIndiaStates.has(state)) return { min: 3, max: 5, region: "South India" };
  return { min: 5, max: 7, region: "Rest of India" };
}

export function getDeliveryEstimate({
  dispatchTimeDays = 1,
  address,
  from = new Date(),
}: {
  dispatchTimeDays?: number;
  address?: DeliveryAddressInput | null;
  from?: Date;
}) {
  const safeDispatchTimeDays = normalizeDispatchDays(dispatchTimeDays);
  const band = deliveryBandForAddress(address);
  const minDate = addDays(from, safeDispatchTimeDays + band.min);
  const maxDate = addDays(from, safeDispatchTimeDays + band.max);

  return {
    dispatchTimeDays: safeDispatchTimeDays,
    deliveryMinDays: band.min,
    deliveryMaxDays: band.max,
    region: band.region,
    startDate: minDate.toISOString(),
    endDate: maxDate.toISOString(),
    label: `${formatDate(minDate)} - ${formatDate(maxDate)}`,
  };
}

export function formatDate(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(date);
}
