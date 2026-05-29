import type { LucideIcon } from "lucide-react";

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
  return (
    <div className="rounded-lg border border-[var(--brand-border)] bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-text-muted)]">
            {label}
          </p>
          <p className="mt-3 font-display text-4xl font-semibold">{value}</p>
        </div>
        {Icon && (
          <div className="rounded-full bg-[var(--brand-off-white)] p-3">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {detail && <p className="mt-3 text-sm text-[var(--brand-text-muted)]">{detail}</p>}
    </div>
  );
}
