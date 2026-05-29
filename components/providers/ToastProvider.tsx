"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "info" | "warning";

export type ToastInput = {
  message: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type Toast = ToastInput & { id: string };

type ToastContextValue = {
  showToast: (t: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((t: ToastInput) => {
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now());
    const duration = t.durationMs ?? 3000;
    setToasts((prev) => [...prev, { ...t, id, variant: t.variant ?? "success" }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, duration);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed right-4 top-4 z-[200] flex max-w-sm flex-col gap-2"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-xl backdrop-blur",
              t.variant === "success" && "border-green-200 bg-green-50 text-green-900",
              t.variant === "error" && "border-red-200 bg-red-50 text-red-900",
              t.variant === "info" && "border-[var(--brand-border)] bg-white text-black",
              t.variant === "warning" && "border-amber-200 bg-amber-50 text-amber-900",
            )}
          >
            <p className="flex-1 font-medium leading-snug">{t.message}</p>
            <button
              type="button"
              className="rounded p-0.5 hover:bg-white/20"
              aria-label="Dismiss notification"
              onClick={() =>
                setToasts((prev) => prev.filter((x) => x.id !== t.id))
              }
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
