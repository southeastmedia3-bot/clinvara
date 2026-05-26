"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { announcements } from "@/lib/data/announcements";

const INTERVAL_MS = 4000;

export function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % announcements.length);
  }, []);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + announcements.length) % announcements.length);
  }, []);

  useEffect(() => {
    const id = window.setInterval(next, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [next]);

  const current = announcements[index];

  return (
    <div
      className="relative z-[110] flex h-10 w-full items-center justify-center bg-[var(--brand-accent)] text-black"
      role="region"
      aria-label="Promotional announcements"
    >
      <button
        type="button"
        aria-label="Previous offer"
        onClick={() => prev()}
        className="absolute left-3 hidden opacity-80 transition-opacity hover:opacity-100 md:inline-flex"
      >
        <ChevronLeft className="h-[18px] w-[18px]" />
      </button>

      <div className="mx-10 max-w-[90vw] overflow-hidden text-center md:mx-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.href + index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <Link
              href={current.href}
              className="block truncate text-sm font-medium hover:underline"
            >
              {current.text}
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        type="button"
        aria-label="Next offer"
        onClick={() => next()}
        className="absolute right-3 hidden opacity-80 transition-opacity hover:opacity-100 md:inline-flex"
      >
        <ChevronRight className="h-[18px] w-[18px]" />
      </button>
    </div>
  );
}
