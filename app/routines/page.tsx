"use client";

import Link from "next/link";
import { routines } from "@/lib/data/routines";

export default function RoutinesPage() {
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
            <Link
              href={`/shop?routine=${routine.id}`}
              className="mt-6 inline-flex h-11 w-full items-center justify-center bg-[var(--brand-primary)] text-sm font-semibold text-white hover:bg-white hover:text-black hover:ring-1 hover:ring-black"
            >
              Shop This Routine
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
