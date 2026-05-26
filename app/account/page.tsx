import { Suspense } from "react";
import AccountClient from "./AccountClient";

export const dynamic = "force-dynamic";

function AccountFallback() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-10 lg:px-8">
      <div className="rounded-2xl border border-[var(--brand-border)] bg-white p-10 text-center">
        Loading account...
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<AccountFallback />}>
      <AccountClient />
    </Suspense>
  );
}