"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { heroSlides } from "@/lib/data/heroSlides";
import { SafeImage } from "@/components/shared/SafeImage";
import { Badge } from "@/components/ui/Badge";

const AUTO_MS = 5000;

function heroTitleParts(title: string) {
  const cleanTitle = title.replace(
    /(?:\u2122|\u00e2\u201e\u00a2|\u00c3\u00a2\u20ac\u017e\u00c2\u00a2|\(TM\))/g,
    "",
  );
  const match = cleanTitle.match(/^(.*?)\s*\((Powered by .*?)\)$/);
  return {
    primary: match?.[1] || cleanTitle,
    secondary: match?.[2] || "",
  };
}

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
  const title = heroTitleParts(slide.title);

  return (
    <section
      className="relative w-full overflow-hidden bg-[var(--brand-off-white)] md:h-[80vh] md:min-h-[520px] md:max-h-[680px]"
      aria-label="Featured products"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative mx-auto max-w-[1440px] md:h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.href}
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="grid md:h-full md:grid-cols-[46fr_54fr]"
          >
            <div
              className="order-2 flex flex-col justify-center px-6 py-10 md:order-1 md:px-14 md:py-12 lg:px-20 xl:px-24"
              style={{
                background: `radial-gradient(circle at 12% 18%, rgba(255,255,255,0.72), transparent 38%), ${slide.bgColor}`,
              }}
            >
              <div className="max-w-[520px]">
                <Badge className="mb-5 w-fit rounded-full bg-white/70 px-4 py-1.5 text-[10px] tracking-[0.18em] shadow-sm">
                  {slide.badge}
                </Badge>
                <h1 className="font-display max-w-[520px] text-[38px] font-medium leading-[1.02] tracking-[-0.03em] text-black sm:text-[44px] md:text-[48px] lg:text-[54px] xl:text-[58px]">
                  {title.primary}
                </h1>
                {title.secondary && (
                  <p className="mt-2 font-display text-[28px] font-medium leading-[1.04] tracking-[-0.025em] text-black/85 sm:text-[32px] md:text-[36px] lg:text-[40px]">
                    {title.secondary}
                  </p>
                )}
                <p className="mt-5 max-w-[430px] text-[16px] font-normal leading-[1.75] text-[var(--brand-text-muted)] md:text-[18px]">
                  {slide.subtitle}
                </p>
                <div className="mt-5 flex max-w-[430px] flex-wrap gap-2.5 text-[var(--brand-secondary)]">
                  {slide.benefits.map((b) => (
                    <span
                      key={b}
                      className="rounded-full border border-black/10 bg-white/35 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.11em] backdrop-blur transition hover:border-black/30 hover:bg-white/60"
                    >
                      {b}
                    </span>
                  ))}
                </div>
                <Link
                  href={slide.href}
                  className="mt-7 inline-flex min-h-12 w-fit items-center gap-3 rounded-full border border-black bg-black px-6 text-[12px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_14px_32px_rgba(0,0,0,0.12)] transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black hover:shadow-[0_18px_40px_rgba(0,0,0,0.16)]"
                >
                  {slide.cta}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            <div
              className="order-1 relative flex h-[340px] items-center justify-center px-6 py-8 md:order-2 md:h-full md:px-12 lg:px-16"
              style={{
                background: `radial-gradient(circle at 50% 45%, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.48) 42%, ${slide.bgColor} 78%)`,
              }}
            >
              <div className="relative flex aspect-[3/4] h-[300px] w-auto items-center justify-center overflow-hidden rounded-[34px] border border-white/70 bg-white/35 p-0 shadow-[0_30px_90px_rgba(0,0,0,0.10)] backdrop-blur-sm sm:h-[340px] md:h-[74%] md:min-h-[410px] md:max-h-[540px]">
                <div className="pointer-events-none absolute inset-4 rounded-[28px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.82),transparent_68%)]" />
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative h-full min-h-[280px] w-full"
                >
                  <SafeImage
                    src={slide.image}
                    alt={slide.title}
                    label={slide.title}
                    fill
                    priority
                    sizes="(max-width:768px) 100vw, 52vw"
                    className="object-cover object-center drop-shadow-[0_22px_34px_rgba(0,0,0,0.18)]"
                  />
                </motion.div>
              </div>
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
