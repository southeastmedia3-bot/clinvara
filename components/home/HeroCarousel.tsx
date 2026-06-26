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
      className="relative w-full overflow-hidden bg-[var(--brand-off-white)] md:min-h-[580px] xl:min-h-[620px]"
      aria-label="Featured products"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative mx-auto max-w-[1440px] md:min-h-[580px] xl:min-h-[620px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.href}
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="grid items-stretch md:min-h-[580px] md:grid-cols-[55fr_45fr] xl:min-h-[620px]"
          >
            <div
              className="order-2 flex flex-col justify-center px-6 py-12 md:order-1 md:px-20 md:py-16 lg:px-24 xl:px-[100px]"
              style={{ backgroundColor: slide.bgColor }}
            >
              <div className="max-w-[560px]">
                <Badge className="mb-6 w-fit bg-white">{slide.badge}</Badge>
                <h1 className="font-display text-[clamp(42px,7vw,80px)] font-medium leading-[0.98] tracking-[-0.03em] md:text-[clamp(56px,6vw,76px)] xl:text-[80px]">
                  {slide.title}
                </h1>
                <p className="mt-7 max-w-[500px] text-[18px] font-normal leading-[1.7] text-[var(--brand-text-muted)]">
                  {slide.subtitle}
                </p>
                <div className="mt-6 flex max-w-[500px] flex-wrap gap-3 text-[var(--brand-secondary)]">
                  {slide.benefits.map((b) => (
                    <span
                      key={b}
                      className="rounded-full border border-[#DDDDDD] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.08em]"
                    >
                      {b}
                    </span>
                  ))}
                </div>
                <Link
                  href={slide.href}
                  className="mt-8 inline-flex min-h-11 items-center border-b border-current pb-0.5 pr-3 text-[12px] font-semibold uppercase tracking-[0.25em]"
                >
                  {slide.cta}
                </Link>
              </div>
            </div>

            <div
              className="order-1 relative flex h-[260px] items-center justify-center md:order-2 md:min-h-[580px] xl:min-h-[620px]"
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
