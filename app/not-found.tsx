import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-text-muted)]">
        404
      </p>
      <h1 className="mt-3 font-display text-5xl font-semibold">
        Page not found
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-[var(--brand-text-muted)]">
        The page you are looking for may have moved, or the link may be incorrect.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white"
        >
          Home
        </Link>
        <Link
          href="/shop"
          className="inline-flex h-11 items-center justify-center rounded-full border border-black px-6 text-sm font-semibold"
        >
          Shop
        </Link>
        <Link
          href="/contact"
          className="inline-flex h-11 items-center justify-center rounded-full border border-black px-6 text-sm font-semibold"
        >
          Contact
        </Link>
      </div>
    </main>
  );
}
