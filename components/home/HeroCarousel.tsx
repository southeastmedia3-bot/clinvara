"use client";

import { useCallback, useEffect, useState } from "react";

import Link from "next/link";

import { AnimatePresence, motion } from "framer-motion";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { heroSlides } from "@/lib/data/heroSlides";

import { SafeImage } from "@/components/shared/SafeImage";

import { Badge } from "@/components/ui/Badge";

const AUTO_MS = 5000;

export function HeroCarousel() {
  const [index, setIndex] = useState(0);

  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setIndex(
      (i) => (i + 1) % heroSlides.length,
    );
  }, []);

  const prev = useCallback(() => {
    setIndex(
      (i) =>
        (i - 1 + heroSlides.length) %
        heroSlides.length,
    );
  }, []);

  useEffect(() => {
    if (paused) return;

    const id = window.setInterval(
      next,
      AUTO_MS,
    );

    return () =>
      window.clearInterval(id);
  }, [next, paused, index]);

  const slide = heroSlides[index];

  return (
    <section
      className="relative w-full overflow-hidden bg-[var(--brand-off-white)] md:h-[620px]"
      aria-label="Featured products"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative mx-auto max-w-[1440px] md:h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.href}
            initial={{
              opacity: 0,
              x: 40,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            exit={{
              opacity: 0,
              x: -40,
            }}
            transition={{
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="grid items-stretch md:h-full md:grid-cols-2"
          >
            <div
              className="order-2 flex flex-col justify-center px-6 py-12 md:order-1 md:px-14 lg:px-20"
              style={{
                backgroundColor: slide.bgColor,
              }}
            >
              <Badge className="mb-5 w-fit border border-black bg-white px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-black">
                {slide.badge}
              </Badge>

              <h1 className="font-display text-[42px] font-semibold leading-[1.05] tracking-[-0.03em] text-black md:text-[64px]">
                {slide.title}
              </h1>

              <p className="mt-5 max-w-md text-[15px] leading-relaxed tracking-[0.01em] text-zinc-600">
                {slide.subtitle}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                {slide.benefits.map((b) => (
                  <span
                    key={b}
                    className="rounded-full border border-zinc-300 bg-white/80 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-700 backdrop-blur-sm"
                  >
                    {b}
                  </span>
                ))}
              </div>

              <Link
                href={slide.href}
                className="mt-10 inline-flex h-12 w-[190px] items-center justify-center border border-black bg-black text-[12px] font-semibold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:bg-white hover:text-black"
              >
                {slide.cta}
              </Link>
            </div>

            <div
              className="order-1 relative flex h-[280px] items-center justify-center md:order-2 md:h-full md:min-h-[520px]"
              style={{
                background: `radial-gradient(circle at center, #ffffff 0%, ${slide.bgColor} 70%)`,
              }}
            >
              <motion.div
                animate={{
                  y: [0, -12, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative h-[240px] w-full max-w-xl md:h-[460px]"
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
          className="group absolute left-6 top-1/2 hidden -translate-y-1/2 md:block"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm transition-all duration-300 group-hover:border-black">
            <ChevronLeft className="h-5 w-5 text-black" />
          </span>
        </button>

        <button
          type="button"
          aria-label="Next slide"
          onClick={() => {
            next();
            setPaused(true);
          }}
          className="group absolute right-6 top-1/2 hidden -translate-y-1/2 md:block"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm transition-all duration-300 group-hover:border-black">
            <ChevronRight className="h-5 w-5 text-black" />
          </span>
        </button>

        <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => {
                setIndex(i);
                setPaused(true);
              }}
              className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                i === index
                  ? "bg-black"
                  : "bg-black/20"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}