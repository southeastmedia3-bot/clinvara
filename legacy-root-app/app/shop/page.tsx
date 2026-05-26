import { Suspense } from "react";
import type { Metadata } from "next";
import { ShopPageClient } from "@/components/shop/ShopPageClient";

export const metadata: Metadata = {
  title: "Shop All Products",
  description:
    "Browse CLINVARA serums, moisturizers, sunscreens, and hair care. Filter by concern, category, and price.",
};

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1440px] px-4 py-12 lg:px-8">
          <div className="h-10 w-48 skeleton" />
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square skeleton" />
            ))}
          </div>
        </div>
      }
    >
      <ShopPageClient />
    </Suspense>
  );
}
