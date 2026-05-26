"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { heroSlides } from "@/lib/data/heroSlides";
import { SafeImage } from "@/components/shared/SafeImage";
import { Badge } from "@/components/ui/Badge";

const AUTO_MS = 5000;

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % heroSlides.length);
  }, []);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + heroSlides.length) % heroSlides.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(next, AUTO_MS);
    return () => window.clearInterval(id);
  }, [next, paused, index]);

  const slide = heroSlides[index];

  return (
    <section
      className="relative w-full overflow-hidden bg-[var(--brand-off-white)] md:h-[520px]"
      aria-label="Featured products"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative mx-auto max-w-[1440px] md:h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.href}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="grid items-stretch md:h-full md:grid-cols-2"
          >
            <div
              className="order-2 flex flex-col justify-center px-6 py-10 md:order-1 md:px-12 lg:px-16"
              style={{ backgroundColor: slide.bgColor }}
            >
              <Badge className="mb-4 w-fit bg-white">{slide.badge}</Badge>
              <h1 className="font-display text-4xl font-semibold leading-[1.15] tracking-[-0.02em] md:text-[52px]">
                {slide.title}
              </h1>
              <p className="mt-4 max-w-md text-[15px] text-[var(--brand-text-muted)]">
                {slide.subtitle}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {slide.benefits.map((b) => (
                  <span
                    key={b}
                    className="rounded-full border border-[#DDDDDD] px-3 py-1 text-xs font-medium"
                  >
                    {b}
                  </span>
                ))}
              </div>
              <Link
                href={slide.href}
                className="mt-8 inline-flex h-12 w-[160px] items-center justify-center bg-[var(--brand-primary)] text-sm font-semibold text-white transition-colors hover:bg-white hover:text-[var(--brand-primary)] hover:ring-1 hover:ring-[var(--brand-primary)]"
              >
                {slide.cta}
              </Link>
            </div>

            <div
              className="order-1 relative flex h-[240px] items-center justify-center md:order-2 md:h-full md:min-h-[420px]"
              style={{
                background: `radial-gradient(circle at center, #ffffff 0%, ${slide.bgColor} 70%)`,
              }}
            >
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="relative h-[200px] w-full max-w-lg md:h-[380px]"
              >
                <SafeImage
                  src={slide.image}
                  alt={slide.title}
                  label={slide.title}
                  fill
                  priority
                  sizes="(max-width:768px) 100vw, 50vw"
                  className="object-contain"
                />
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => {
            prev();
            setPaused(true);
          }}
          className="absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/95 p-2 shadow transition hover:bg-black hover:text-white md:inline-flex"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => {
            next();
            setPaused(true);
          }}
          className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/95 p-2 shadow transition hover:bg-black hover:text-white md:inline-flex"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => {
                setIndex(i);
                setPaused(true);
              }}
              className={`h-2.5 w-2.5 rounded-full border border-black ${
                i === index ? "bg-black" : "bg-transparent"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
