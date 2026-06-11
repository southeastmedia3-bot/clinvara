import type { Metadata } from "next";
import OrderDetailsClient from "./OrderDetailsClient";

export const metadata: Metadata = {
  title: "Order Details | CLINVARA",
  description: "View your CLINVARA order details, delivery estimate, and tracking timeline.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrderDetailsPage({
  params,
}: {
  params: { orderId: string };
}) {
  return <OrderDetailsClient orderId={decodeURIComponent(params.orderId)} />;
}
