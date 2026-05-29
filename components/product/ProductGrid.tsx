import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/ProductCard";

export function ProductGrid({
  products,
  mobileScroll = false,
  mobileColumns = 2,
}: {
  products: Product[];
  mobileScroll?: boolean;
  mobileColumns?: 1 | 2;
}) {
  if (mobileScroll) {
    return (
      <div className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-2 md:gap-8 md:overflow-visible lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            layout="scroll"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4 ${
        mobileColumns === 1 ? "grid-cols-1" : "grid-cols-2"
      }`}
    >
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
