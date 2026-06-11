import type { Metadata } from "next";
import WishlistClient from "./WishlistClient";

export const metadata: Metadata = {
  title: "Wishlist | CLINVARA",
  description: "View and manage your saved CLINVARA skincare products.",
  alternates: {
    canonical: "/wishlist",
  },
  openGraph: {
    title: "Wishlist | CLINVARA",
    description: "View and manage your saved CLINVARA skincare products.",
    url: "/wishlist",
  },
  twitter: {
    title: "Wishlist | CLINVARA",
    description: "View and manage your saved CLINVARA skincare products.",
  },
};

export default function WishlistPage() {
  return <WishlistClient />;
}
