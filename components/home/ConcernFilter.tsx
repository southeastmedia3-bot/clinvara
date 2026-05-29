import Link from "next/link";
import { concernPills } from "@/lib/data/products";
import { getStorefrontProducts } from "@/lib/firebase/products";

function slugify(value: string) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function ConcernFilter() {
  const products = await getStorefrontProducts();
  const dynamicPills = Array.from(
    new Map(
      products.flatMap((product) =>
        product.concerns.map((concern, index) => [
          product.concernSlugs?.[index] || slugify(concern),
          { label: concern, slug: product.concernSlugs?.[index] || slugify(concern) },
        ]),
      ),
    ).values(),
  );
  const pills = dynamicPills.length ? dynamicPills : concernPills;

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-6 lg:px-8">
      <h2 className="mb-6 font-display text-2xl font-semibold md:text-[28px]">
        Shop by Concerns
      </h2>
      <div className="flex flex-wrap gap-3">
        {pills.map((pill) => (
          <Link
            key={pill.slug}
            href={`/shop?concern=${pill.slug}`}
            className="rounded-full border-[1.5px] border-[var(--brand-border)] px-5 py-2.5 text-[13px] font-medium transition-all duration-200 hover:border-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white"
          >
            {pill.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
