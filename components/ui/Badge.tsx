import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center border border-[var(--brand-primary)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em]",
        className,
      )}
    >
      {children}
    </span>
  );
}
