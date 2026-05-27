"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Globe2, LogOut, Mail, MapPin, PackageSearch, UserPlus, X } from "lucide-react";
import { signOut } from "firebase/auth";
import { useAuthStore } from "@/lib/store/authStore";
import { useCartStore } from "@/lib/store/cartStore";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { firebaseAuth } from "@/lib/firebase/client";
import { BrandLogo } from "@/components/shared/BrandLogo";

type AccountMenuProps = {
  open: boolean;
  onClose: () => void;
};

export function AccountMenu({ open, onClose }: AccountMenuProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const setLoginOpen = useAuthStore((s) => s.setLoginModalOpen);
  const setRegisterOpen = useAuthStore((s) => s.setRegisterModalOpen);
  const logout = useAuthStore((s) => s.logout);
  const displayName =
    user?.name ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    user?.phone ||
    "Signed in";

  const openSignIn = () => {
    onClose();
    setRegisterOpen(false);
    setLoginOpen(true);
  };

  const openRegister = () => {
    onClose();
    setLoginOpen(false);
    setRegisterOpen(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(firebaseAuth);
    } finally {
      logout();
      useCartStore.getState().clearCart();
      useWishlistStore.setState({
        productIds: [],
        firestoreReady: false,
      });
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close account menu"
            className="fixed inset-0 z-[145] bg-black/20 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Account menu"
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 28 }}
            transition={{ duration: 0.22 }}
            className="fixed right-0 top-0 z-[150] flex h-full w-[min(420px,100vw)] flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--brand-border)] px-6 py-5">
              <div>
                <BrandLogo className="h-14 w-24" />
                <p className="mt-3 font-display text-2xl font-semibold">My Account</p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--brand-text-muted)]">
                  CLINVARA Membership
                </p>
              </div>
              <button
                type="button"
                aria-label="Close account menu"
                className="rounded-full p-2 hover:bg-[var(--brand-off-white)]"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {isAuthenticated ? (
                <div className="mb-6 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-off-white)] p-4">
                  <p className="text-sm text-[var(--brand-text-muted)]">Signed in as</p>
                  <p className="mt-1 font-semibold">{displayName}</p>
                  <p className="mt-1 text-xs capitalize text-[var(--brand-text-muted)]">
                    {user?.provider || "email"} sign-in
                  </p>
                </div>
              ) : (
                <div className="mb-6 space-y-3">
                  <button
                    type="button"
                    className="h-12 w-full rounded-full bg-black text-sm font-semibold text-white transition hover:bg-black/85"
                    onClick={openSignIn}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    className="h-12 w-full rounded-full border border-black text-sm font-semibold transition hover:bg-black hover:text-white"
                    onClick={openRegister}
                  >
                    Create Account
                  </button>
                </div>
              )}

              <nav className="space-y-1 text-sm font-medium">
                <Link
                  href="/account"
                  className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-[var(--brand-off-white)]"
                  onClick={onClose}
                >
                  <UserPlus className="h-4 w-4" />
                  Account Dashboard
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-[var(--brand-off-white)]"
                  onClick={onClose}
                >
                  <Mail className="h-4 w-4" />
                  Contact Us
                </Link>
                <Link
                  href="/track-order"
                  className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-[var(--brand-off-white)]"
                  onClick={onClose}
                >
                  <PackageSearch className="h-4 w-4" />
                  Track Order
                </Link>
              </nav>

              <div className="mt-8 border-t border-[var(--brand-border)] pt-5">
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-text-muted)]">
                  Country
                  <span className="mt-2 flex h-12 items-center gap-3 rounded-full border border-[var(--brand-border)] px-4 text-sm normal-case tracking-normal text-black">
                    <Globe2 className="h-4 w-4" />
                    <select className="flex-1 bg-transparent outline-none" defaultValue="IN">
                      <option value="IN">India</option>
                    </select>
                    <MapPin className="h-4 w-4 text-[var(--brand-text-muted)]" />
                  </span>
                </label>
              </div>
            </div>

            {isAuthenticated && (
              <div className="border-t border-[var(--brand-border)] p-6">
                <button
                  type="button"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-black text-sm font-semibold hover:bg-black hover:text-white"
                  onClick={() => void handleLogout()}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
