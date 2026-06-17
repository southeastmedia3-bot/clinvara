import { Suspense } from "react";
import type { Metadata } from "next";
import OrdersClient from "./OrdersClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Orders | CLINVARA",
  description: "View your CLINVARA order history, tracking updates, invoices, and return options.",
  alternates: { canonical: "/account/orders" },
  robots: {
    index: false,
    follow: false,
  },
};

function OrdersFallback() {
  return (
    <div className="mx-auto max-w-[1180px] px-4 py-10 lg:px-8">
      <div className="skeleton h-80 rounded-2xl" />
    </div>
  );
}

export default function AccountOrdersPage() {
  return (
    <Suspense fallback={<OrdersFallback />}>
      <OrdersClient />
    </Suspense>
  );
}
