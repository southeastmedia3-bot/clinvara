import Link from "next/link";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getStorefrontBestSellers, getStorefrontProducts } from "@/lib/firebase/products";

export async function BestSellers() {
  const bestSellers = await getStorefrontBestSellers();
  const allProducts = await getStorefrontProducts();
  const products = bestSellers.length ? bestSellers : allProducts.slice(0, 4);

  return (
    <section id="best-sellers" className="mx-auto max-w-[1440px] px-4 py-6 lg:px-8">
      <header className="mb-8 mt-14 md:mt-[60px]">
        <h2 className="font-display text-3xl font-semibold md:text-4xl">
          Our Best Sellers
        </h2>
        <div className="mt-2 h-0.5 w-12 bg-black" />
      </header>

      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <div className="rounded-xl border border-[var(--brand-border)] p-6 text-sm text-[var(--brand-text-muted)]">
          Products are being prepared. Please visit the shop again shortly.
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Link href="/shop" className="text-sm font-semibold underline">
          View All Products →
        </Link>
      </div>
    </section>
  );
}
