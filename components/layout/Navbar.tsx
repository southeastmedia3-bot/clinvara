"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Menu,
  Search,
  User,
  Star,
  ShoppingBag,
  X,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cartStore";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { useAuthStore } from "@/lib/store/authStore";
import { bestSellers } from "@/lib/data/products";
import { SafeImage } from "@/components/shared/SafeImage";
import { formatINR } from "@/lib/utils";
import { CartDrawer } from "@/components/ui/CartDrawer";
import { LoginModal } from "@/components/ui/LoginModal";
import { SearchOverlay } from "@/components/ui/SearchOverlay";
import { AccountMenu } from "@/components/ui/AccountMenu";

const shopColumns = {
  skin: [
    { label: "Serums", href: "/shop?category=serums" },
    { label: "Moisturizers", href: "/shop?category=moisturizers" },
    { label: "Cleansers", href: "/shop?category=cleansers" },
    { label: "Toners", href: "/shop?category=serums" },
    { label: "Suncare", href: "/shop?category=suncare" },
    { label: "Eye Care", href: "/shop?category=serums" },
    { label: "Exfoliators", href: "/shop?category=cleansers" },
  ],
  hair: [
    { label: "Shampoo", href: "/shop?category=hair" },
    { label: "Conditioner", href: "/shop?category=hair" },
    { label: "Scalp Treatments", href: "/shop?category=hair" },
    { label: "Hair Serums", href: "/shop?category=hair" },
  ],
  concerns: [
    { label: "Acne", href: "/shop?concern=acne-control" },
    { label: "Dryness", href: "/shop?concern=dryness-dehydration" },
    { label: "Dark Spots", href: "/shop?concern=pigmentation" },
    { label: "Fine Lines", href: "/shop?concern=fine-lines-wrinkles" },
    { label: "Oiliness", href: "/shop?concern=oiliness" },
    { label: "Sensitivity", href: "/shop?concern=sensitive-skin" },
    { label: "Hair Fall", href: "/shop?concern=hair-fall" },
  ],
};

const featured = bestSellers[0];

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cartCount = useCartStore((s) =>
    s.items.reduce((n, i) => n + i.quantity, 0),
  );
  const wishCount = useWishlistStore((s) => s.productIds.length);
  const openCart = useCartStore((s) => s.openCart);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setShopOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  const handleBestSellers = (e: React.MouseEvent) => {
    if (isHome) {
      e.preventDefault();
      document.getElementById("best-sellers")?.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  const openMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setShopOpen(true);
  };

  const scheduleCloseMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setShopOpen(false), 120);
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-[100] border-b border-[var(--brand-border)] bg-white transition-shadow",
          scrolled && "shadow-[0_2px_12px_rgba(0,0,0,0.07)]",
        )}
      >
        <nav
          className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 md:h-16 lg:px-8"
          aria-label="Main"
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex md:hidden"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-6 w-6 text-[var(--brand-primary)]" />
            </button>
            <Link
              href="/"
              className="font-display text-[22px] font-bold tracking-[0.04em] text-[var(--brand-primary)] md:text-[26px]"
              style={{ fontWeight: 700 }}
            >
              CLINVARA
            </Link>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <div
              className="relative"
              onMouseEnter={openMega}
              onMouseLeave={scheduleCloseMega}
            >
              <button
                type="button"
                className="nav-link-underline flex items-center gap-1 text-sm font-medium text-[var(--brand-primary)]"
                aria-expanded={shopOpen}
                aria-haspopup="true"
                onClick={() => setShopOpen((v) => !v)}
              >
                Shop
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            <Link
              href={isHome ? "#best-sellers" : "/shop?filter=bestsellers"}
              onClick={handleBestSellers}
              className="nav-link-underline text-sm font-medium text-[var(--brand-primary)]"
            >
              Best Sellers
            </Link>
            <Link
              href="/routines"
              className="nav-link-underline text-sm font-medium text-[var(--brand-primary)]"
            >
              Routines
            </Link>
            <Link
              href="/blog"
              className="nav-link-underline text-sm font-medium text-[var(--brand-primary)]"
            >
              Blog
            </Link>
            <Link
              href="/track-order"
              className="nav-link-underline text-sm font-medium text-[var(--brand-primary)]"
            >
              Track Order
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Search"
              className="text-[var(--brand-primary)] transition-colors hover:text-[var(--brand-accent)]"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-[22px] w-[22px]" />
            </button>
            <button
              type="button"
              aria-label="Open account menu"
              aria-expanded={accountOpen}
              className="hidden text-[var(--brand-primary)] transition-colors hover:text-[var(--brand-accent)] sm:inline-flex"
              onClick={() => setAccountOpen(true)}
            >
              <User className="h-[22px] w-[22px]" />
            </button>
            <Link
              href="/account#wishlist"
              className="relative hidden text-[var(--brand-primary)] transition-colors hover:text-[var(--brand-accent)] sm:inline-flex"
              aria-label="Wishlist"
            >
              <Star className="h-[22px] w-[22px]" />
              {wishCount > 0 && (
                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[var(--brand-accent)]" />
              )}
            </Link>
            <button
              type="button"
              aria-label="Open cart"
              className="relative text-[var(--brand-primary)] transition-colors hover:text-[var(--brand-accent)]"
              onClick={() => openCart()}
            >
              <ShoppingBag className="h-[22px] w-[22px]" />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--brand-accent)] px-1 text-[10px] font-bold text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>
          </div>
        </nav>

        {/* Mega menu */}
        <div
          className="relative hidden md:block"
          onMouseEnter={openMega}
          onMouseLeave={scheduleCloseMega}
        >
          {shopOpen && (
            <div className="absolute left-0 right-0 top-0 border-b border-[var(--brand-border)] bg-white shadow-lg">
              <div className="mx-auto grid max-w-[1440px] grid-cols-3 gap-10 px-8 py-8 lg:grid-cols-4">
                <div>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--brand-text-muted)]">
                    Skin &amp; Body
                  </p>
                  <ul className="space-y-2 text-sm font-medium">
                    {shopColumns.skin.map((l) => (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          className="hover:text-[var(--brand-accent)]"
                          onClick={() => setShopOpen(false)}
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--brand-text-muted)]">
                    Hair Care
                  </p>
                  <ul className="space-y-2 text-sm font-medium">
                    {shopColumns.hair.map((l) => (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          className="hover:text-[var(--brand-accent)]"
                          onClick={() => setShopOpen(false)}
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--brand-text-muted)]">
                    Shop by Concern
                  </p>
                  <ul className="space-y-2 text-sm font-medium">
                    {shopColumns.concerns.map((l) => (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          className="hover:text-[var(--brand-accent)]"
                          onClick={() => setShopOpen(false)}
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                {featured && (
                  <Link
                    href={`/shop/${featured.slug}`}
                    className="hidden border border-[var(--brand-border)] p-4 transition-colors hover:border-[var(--brand-primary)] lg:block"
                    onClick={() => setShopOpen(false)}
                  >
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em]">
                      Featured
                    </p>
                    <div className="relative mb-3 aspect-square bg-white">
                      <SafeImage
                        src={featured.image}
                        alt={featured.name}
                        label={featured.name}
                        fill
                        sizes="120px"
                        className="object-contain p-2"
                      />
                    </div>
                    <p className="font-body text-sm font-medium">{featured.name}</p>
                    <p className="mt-1 text-sm font-semibold">
                      {formatINR(featured.price)}
                    </p>
                    <span className="mt-3 inline-block text-xs font-semibold underline">
                      Shop Now
                    </span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[160] md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--brand-border)] px-4 py-3">
              <span className="font-display text-lg font-bold">Menu</span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <button
                type="button"
                className="flex w-full items-center justify-between border-b border-[var(--brand-border)] py-3 text-left font-medium"
                onClick={() => setMobileShopOpen((v) => !v)}
                aria-expanded={mobileShopOpen}
              >
                Shop
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    mobileShopOpen && "rotate-180",
                  )}
                />
              </button>
              {mobileShopOpen && (
                <div className="space-y-4 py-3 text-sm">
                  <div>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--brand-text-muted)]">
                      Skin &amp; Body
                    </p>
                    <ul className="space-y-2">
                      {shopColumns.skin.map((l) => (
                        <li key={l.href}>
                          <Link href={l.href} onClick={() => setMobileOpen(false)}>
                            {l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--brand-text-muted)]">
                      Hair Care
                    </p>
                    <ul className="space-y-2">
                      {shopColumns.hair.map((l) => (
                        <li key={l.href}>
                          <Link href={l.href} onClick={() => setMobileOpen(false)}>
                            {l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--brand-text-muted)]">
                      Concerns
                    </p>
                    <ul className="space-y-2">
                      {shopColumns.concerns.map((l) => (
                        <li key={l.href}>
                          <Link href={l.href} onClick={() => setMobileOpen(false)}>
                            {l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              <Link
                href={isHome ? "#best-sellers" : "/shop?filter=bestsellers"}
                className="block border-b border-[var(--brand-border)] py-3 font-medium"
                onClick={(e) => {
                  handleBestSellers(e);
                  setMobileOpen(false);
                }}
              >
                Best Sellers
              </Link>
              <Link
                href="/routines"
                className="block border-b border-[var(--brand-border)] py-3 font-medium"
                onClick={() => setMobileOpen(false)}
              >
                Routines
              </Link>
              <Link
                href="/blog"
                className="block border-b border-[var(--brand-border)] py-3 font-medium"
                onClick={() => setMobileOpen(false)}
              >
                Blog
              </Link>
              <Link
                href="/track-order"
                className="block border-b border-[var(--brand-border)] py-3 font-medium"
                onClick={() => setMobileOpen(false)}
              >
                Track Order
              </Link>
              <button
                type="button"
                className="mt-4 w-full border border-black py-2 text-sm font-semibold"
                onClick={() => {
                  setAccountOpen(true);
                  setMobileOpen(false);
                }}
              >
                Account
              </button>
              <Link
                href="/account#wishlist"
                className="mt-3 block text-center text-sm font-semibold underline"
                onClick={() => setMobileOpen(false)}
              >
                Wishlist {wishCount > 0 ? `(${wishCount})` : ""}
              </Link>
            </div>
          </div>
        </div>
      )}

      <CartDrawer />
      <AccountMenu open={accountOpen} onClose={() => setAccountOpen(false)} />
      <LoginModal />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
