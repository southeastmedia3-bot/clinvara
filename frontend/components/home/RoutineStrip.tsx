import Link from "next/link";

export function RoutineStrip() {
  return (
    <section className="bg-[var(--brand-primary)] py-10 text-white">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-6 px-4 text-center md:flex-row md:text-left lg:px-8">
        <p className="font-display text-2xl font-semibold md:text-[28px]">
          Build Your Personalised Skincare Routine
        </p>
        <p className="max-w-md text-[15px] text-white/75">
          Answer 3 quick questions → Get your routine
        </p>
        <Link
          href="/routines"
          className="inline-flex h-12 min-w-[160px] items-center justify-center bg-white px-6 text-sm font-semibold text-black transition-colors hover:bg-black hover:text-white hover:ring-1 hover:ring-white"
        >
          Take the Quiz
        </Link>
      </div>
    </section>
  );
}
