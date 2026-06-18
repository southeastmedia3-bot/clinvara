import type { LucideIcon } from "lucide-react";
import { formatCompactNumber } from "@/lib/admin/format";

export function AdminStatCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  detail?: string;
  icon?: LucideIcon;
}) {
  const displayValue = typeof value === "number" ? formatCompactNumber(value) : value;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
            {label}
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums text-zinc-950">
            {displayValue}
          </p>
        </div>
        {Icon && (
          <div className="rounded-full bg-zinc-100 p-3 text-zinc-700">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        )}
      </div>
      {detail && <p className="mt-3 text-sm leading-6 text-zinc-500">{detail}</p>}
    </div>
  );
}
