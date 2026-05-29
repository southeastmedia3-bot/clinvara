"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import { isApprovedAdmin } from "@/lib/admin/auth";

type GuardState = "loading" | "authorized" | "unauthorized";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GuardState>("loading");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      setState("loading");
      const approved = await isApprovedAdmin(user).catch(() => false);
      setState(approved ? "authorized" : "unauthorized");
    });

    return unsubscribe;
  }, []);

  if (state === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--brand-off-white)] px-6">
        <div className="w-full max-w-sm rounded-lg border border-[var(--brand-border)] bg-white p-8 text-center">
          <div className="skeleton mx-auto h-12 w-12 rounded-full" />
          <p className="mt-5 text-sm uppercase tracking-[0.18em] text-[var(--brand-text-muted)]">
            Checking admin access
          </p>
        </div>
      </div>
    );
  }

  if (state === "unauthorized") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--brand-off-white)] px-6">
        <div className="w-full max-w-lg rounded-lg border border-[var(--brand-border)] bg-white p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-text-muted)]">
            CLINVARA Admin
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold">
            Unauthorized access
          </h1>
          <p className="mt-4 text-sm leading-6 text-[var(--brand-text-muted)]">
            Sign in with an approved admin account to manage ecommerce operations.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/account"
              className="rounded-full bg-black px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white"
            >
              Go to account
            </Link>
            <button
              type="button"
              onClick={() => void signOut(firebaseAuth)}
              className="rounded-full border border-black px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em]"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
