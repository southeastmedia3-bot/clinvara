"use client";

import { Menu, ShieldCheck } from "lucide-react";

export function AdminTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/90 px-4 backdrop-blur lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-full border border-zinc-200 p-2 lg:hidden"
          aria-label="Open admin navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Admin Console
          </p>
          <p className="hidden text-sm text-zinc-500 sm:block">
            Manage orders, products, customers, and store settings.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700">
          <ShieldCheck className="h-4 w-4" />
          Admin
        </div>
      </div>
    </header>
  );
}
