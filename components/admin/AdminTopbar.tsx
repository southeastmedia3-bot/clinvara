"use client";

import { Menu, Search, ShieldCheck } from "lucide-react";

export function AdminTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[var(--brand-border)] bg-white/95 px-4 backdrop-blur lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-full border border-[var(--brand-border)] p-2 lg:hidden"
          aria-label="Open admin navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-text-muted)]">
            Admin Console
          </p>
          <p className="hidden text-sm text-[var(--brand-text-muted)] sm:block">
            Manage orders, products, customers, and store settings.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-[var(--brand-border)] px-3 py-2 text-sm text-[var(--brand-text-muted)] md:flex">
          <Search className="h-4 w-4" />
          Search inside each section
        </div>
        <div className="flex items-center gap-2 rounded-full bg-[var(--brand-off-white)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em]">
          <ShieldCheck className="h-4 w-4" />
          Admin
        </div>
      </div>
    </header>
  );
}
