import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/ProductCard";

export function ProductGrid({
  products,
  mobileScroll = false,
}: {
  products: Product[];
  mobileScroll?: boolean;
}) {
  if (mobileScroll) {
    return (
      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} layout="scroll" />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
