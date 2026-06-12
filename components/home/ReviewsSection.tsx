"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, BadgeCheck } from "lucide-react";
import { reviews } from "@/lib/data/reviews";
import { StarRating } from "@/components/shared/StarRating";
import type { Review } from "@/lib/types";

export function ReviewsSection() {
  const [start, setStart] = useState(0);
  const [pageSize, setPageSize] = useState(3);
  const [items, setItems] = useState<Review[]>(reviews);

  useEffect(() => {
    fetch("/api/reviews", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { reviews?: Review[] } | null) => {
        if (Array.isArray(data?.reviews) && data.reviews.length) {
          setItems(data.reviews);
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setPageSize(mq.matches ? 1 : 3);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const maxStart = Math.max(0, items.length - pageSize);
  const visible = items.slice(start, start + pageSize);

  useEffect(() => {
    setStart((s) => Math.min(s, maxStart));
  }, [maxStart]);

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-14 lg:px-8">
      <header className="mb-10 text-center">
        <h2 className="font-display text-3xl font-semibold md:text-4xl">
          What Our Customers Say
        </h2>
        <p className="mt-2 text-sm text-[var(--brand-text-muted)]">
          Early customer feedback from verified CLINVARA orders
        </p>
      </header>

      <motion.div
        drag="x"
        dragConstraints={{ left: -24, right: 24 }}
        className="relative"
      >
        <button
          type="button"
          aria-label="Previous reviews"
          className="absolute -left-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border bg-white p-2 shadow md:flex"
          onClick={() => setStart((s) => Math.max(0, s - 1))}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Next reviews"
          className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border bg-white p-2 shadow md:flex"
          onClick={() => setStart((s) => Math.min(maxStart, s + 1))}
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <motion.div className="grid gap-4 md:grid-cols-3">
          {visible.map((r) => (
            <article
              key={r.name + r.date}
              className="flex h-full flex-col border border-[var(--brand-border)] bg-white p-5"
            >
              <motion.div
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <motion.div className="mb-3 flex items-start justify-between gap-2">
                  <motion.div className="flex flex-wrap items-center gap-1">
                    <span className="text-sm font-bold">{r.name}</span>
                    {r.verified && (
                      <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[var(--brand-green-check)]">
                        <BadgeCheck className="h-4 w-4" />
                        Verified Buyer
                      </span>
                    )}
                  </motion.div>
                  <span className="text-xs text-[var(--brand-mid-gray)]">
                    {r.date}
                  </span>
                </motion.div>
                <StarRating rating={r.rating} />
                <p className="mt-3 text-sm font-bold">{r.title}</p>
                <p className="mt-2 flex-1 text-[13px] leading-relaxed text-[var(--brand-text-muted)]">
                  {r.body}
                </p>
                <Link
                  href={r.productSlug}
                  className="mt-4 inline-block text-xs font-semibold underline"
                >
                  🔗 {r.productName}
                </Link>
              </motion.div>
            </article>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
