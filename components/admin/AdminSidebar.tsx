"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Boxes,
  Cable,
  LayoutDashboard,
  MessageSquareText,
  Package,
  RotateCcw,
  ReceiptText,
  Settings,
  Tags,
  Users,
  Wrench,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ReceiptText },
  { href: "/admin/returns", label: "Returns", icon: RotateCcw },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Tags },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquareText },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/external-channels", label: "External Channels", icon: Cable },
  { href: "/admin/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full flex-col border-r border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 px-6 py-5">
        <Link href="/admin" className="font-display text-2xl font-semibold tracking-[0.16em]">
          CLINVARA
        </Link>
        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-zinc-500">
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
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-zinc-950 text-white shadow-sm"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-zinc-200 p-5 text-xs leading-5 text-zinc-500">
        Ecommerce operations for CLINVARA.
      </div>
    </aside>
  );
}
