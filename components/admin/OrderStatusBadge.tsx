export function OrderStatusBadge({ status }: { status?: string }) {
  const normalized = status || "Pending";
  const tone =
    normalized === "Delivered"
      ? "bg-green-50 text-green-700"
      : normalized === "Cancelled" || normalized === "Refunded"
        ? "bg-red-50 text-red-700"
        : "bg-amber-50 text-amber-700";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>
      {normalized}
    </span>
  );
}
