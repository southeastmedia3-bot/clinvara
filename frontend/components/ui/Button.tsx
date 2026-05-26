import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost";
  children: ReactNode;
};

export function Button({
  className,
  variant = "primary",
  children,
  ...props
}: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-colors",
        variant === "primary" &&
          "bg-[var(--brand-primary)] text-white hover:bg-white hover:text-[var(--brand-primary)] hover:ring-1 hover:ring-[var(--brand-primary)]",
        variant === "outline" &&
          "border border-[var(--brand-primary)] bg-white text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white",
        variant === "ghost" && "text-[var(--brand-primary)] hover:text-[var(--brand-accent)]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
