import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  rating,
  max = 5,
  size = 16,
  className,
}: {
  rating: number;
  max?: number;
  size?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }).map((_, i) => {
        const fill = rating >= i + 1 ? 1 : rating > i ? 0.5 : 0;
        return (
          <Star
            key={i}
            width={size}
            height={size}
            className={cn(
              "text-[var(--brand-star)]",
              fill >= 1 && "fill-[var(--brand-star)]",
              fill === 0.5 && "fill-[color-mix(in_srgb,var(--brand-star)_50%,transparent)]",
            )}
            strokeWidth={1.2}
          />
        );
      })}
    </div>
  );
}
