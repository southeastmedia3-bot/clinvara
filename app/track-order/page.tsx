import type { Metadata } from "next";
import { TrackOrderClient } from "@/app/track-order/TrackOrderClient";

export const metadata: Metadata = {
  title: "Track Your Order",
  description: "Track CLINVARA order status using your order ID and contact details.",
  alternates: { canonical: "/track-order" },
  openGraph: {
    title: "Track Your Order | CLINVARA",
    description: "Check whether CLINVARA tracking is available for your order.",
    url: "/track-order",
  },
};

export default function TrackOrderPage() {
  return <TrackOrderClient />;
}
