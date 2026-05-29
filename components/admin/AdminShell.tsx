"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AdminGuard>
      <div className="min-h-screen bg-[var(--brand-off-white)] text-black">
        <div className="fixed inset-y-0 left-0 z-30 hidden w-72 lg:block">
          <AdminSidebar />
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/30"
              onClick={() => setMobileOpen(false)}
              aria-label="Close admin navigation overlay"
            />
            <div className="relative h-full w-72 max-w-[82vw] bg-white shadow-2xl">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-3 rounded-full border border-[var(--brand-border)] p-2"
                aria-label="Close admin navigation"
              >
                <X className="h-4 w-4" />
              </button>
              <AdminSidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        <div className="lg:pl-72">
          <AdminTopbar onMenuClick={() => setMobileOpen(true)} />
          <main className="px-4 py-6 lg:px-8">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
