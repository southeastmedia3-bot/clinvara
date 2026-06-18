import Link from "next/link";
import { SafeImage } from "@/components/shared/SafeImage";

const tiles = [
  { src: "/images/categories/1st.png", label: "Skin & Body", href: "/shop?category=skin-body" },
  { src: "/images/categories/2nd.png", label: "Serums", href: "/shop?category=serums" },
  { src: "/images/categories/3rd.png", label: "Moisturizers", href: "/shop?category=moisturizers" },
  { src: "/images/categories/4th.png", label: "Cleansers", href: "/shop?category=cleansers" },
  { src: "/images/categories/5th.png", label: "Best Sellers", href: "/shop?filter=bestsellers" },
];

export function CategoryFilter() {
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-10 lg:px-8">
      <h2 className="mb-6 font-display text-2xl font-semibold md:text-[28px]">
        Shop by Category
      </h2>
      <div className="flex flex-wrap justify-center gap-8 md:gap-10">
        {tiles.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="group flex w-[96px] flex-col items-center text-center"
          >
            <div className="relative h-24 w-24 overflow-hidden rounded-full border border-[var(--brand-border)] transition-transform group-hover:scale-[1.06] group-hover:border-[var(--brand-accent)]">
              <SafeImage
                src={t.src}
                alt={t.label}
                label={t.label}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
            <span className="mt-3 text-[13px] font-medium">{t.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
