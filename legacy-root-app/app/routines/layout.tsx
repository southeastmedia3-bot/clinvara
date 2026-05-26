import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skincare Routines",
  description:
    "Curated AM/PM routines for oily, dry, acne-prone, and brightening skin goals.",
};

export default function RoutinesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
