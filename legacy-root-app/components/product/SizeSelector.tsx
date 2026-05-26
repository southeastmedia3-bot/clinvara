"use client";

import { cn } from "@/lib/utils";

export function SizeSelector({
  sizes,
  value,
  onChange,
}: {
  sizes: string[];
  value: string;
  onChange: (s: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Choose size">
      {sizes.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
            s === value
              ? "border-black bg-black text-white"
              : "border-[var(--brand-border)] bg-white text-[var(--brand-primary)] hover:border-black",
          )}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
