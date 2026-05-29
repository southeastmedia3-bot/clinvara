"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Boxes,
  LayoutDashboard,
  MessageSquareText,
  Package,
  ReceiptText,
  Settings,
  Tags,
  Users,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ReceiptText },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Tags },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquareText },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full flex-col border-r border-[var(--brand-border)] bg-white">
      <div className="border-b border-[var(--brand-border)] px-6 py-5">
        <Link href="/admin" className="font-display text-2xl font-semibold tracking-[0.18em]">
          CLINVARA
        </Link>
        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--brand-text-muted)]">
          Admin
        </p>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm transition ${
                active
                  ? "bg-black text-white"
                  : "text-[var(--brand-text-muted)] hover:bg-[var(--brand-off-white)] hover:text-black"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-[var(--brand-border)] p-5 text-xs leading-5 text-[var(--brand-text-muted)]">
        Ecommerce operations for CLINVARA.
      </div>
    </aside>
  );
}
