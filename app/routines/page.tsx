"use client";

import Link from "next/link";
import { routines } from "@/lib/data/routines";
import { getProductBySlug } from "@/lib/data/products";
import { useCartStore } from "@/lib/store/cartStore";
import { useToast } from "@/components/providers/ToastProvider";

export default function RoutinesPage() {
  const addItem = useCartStore((s) => s.addItem);
  const { showToast } = useToast();

  const shopRoutine = (routineId: string) => {
    const routine = routines.find((r) => r.id === routineId);
    if (!routine) return;
    routine.steps.forEach((step) => {
      const product = getProductBySlug(step.slug);
      if (!product) return;
      addItem({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.image,
        size: product.sizes[0] ?? "30ml",
        price: product.price,
        quantity: 1,
      });
    });
    showToast({
      message: `${routine.title} added to cart!`,
      variant: "success",
    });
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-12 lg:px-8">
      <header className="mb-12 max-w-2xl text-center md:mx-auto md:text-center">
        <h1 className="font-display text-4xl font-semibold md:text-5xl">
          Find Your Perfect Skincare Routine
        </h1>
        <p className="mt-4 text-[15px] text-[var(--brand-text-muted)]">
          Science-backed routines designed for your skin&apos;s real needs.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {routines.map((routine) => (
          <article
            key={routine.id}
            className="flex flex-col border border-[var(--brand-border)] bg-white p-6"
          >
            <h2 className="font-display text-xl font-semibold">{routine.title}</h2>
            <p className="mt-2 text-sm text-[var(--brand-text-muted)]">
              {routine.description}
            </p>
            <ol className="mt-4 flex-1 space-y-2 text-sm">
              {routine.steps.map((step, i) => (
                <li key={step.slug}>
                  <span className="font-semibold">{i + 1}.</span>{" "}
                  <Link
                    href={`/shop/${step.slug}`}
                    className="underline hover:text-[var(--brand-accent)]"
                  >
                    {step.label}
                  </Link>
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={() => shopRoutine(routine.id)}
              className="mt-6 h-11 w-full bg-[var(--brand-primary)] text-sm font-semibold text-white hover:bg-white hover:text-black hover:ring-1 hover:ring-black"
            >
              Shop This Routine
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
