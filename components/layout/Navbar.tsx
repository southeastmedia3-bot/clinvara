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

  const [searchOpen, setSearchOpen] = useState(false);

  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cartCount = useCartStore((s) =>
    s.items.reduce((n, i) => n + i.quantity, 0),
  );

  const wishCount = useWishlistStore((s) => s.productIds.length);

  const openCart = useCartStore((s) => s.openCart);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);

    onScroll();

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () =>
      window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setShopOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  const handleBestSellers = (
    e: React.MouseEvent,
  ) => {
    if (isHome) {
      e.preventDefault();

      document
        .getElementById("best-sellers")
        ?.scrollIntoView({
          behavior: "smooth",
        });
    }
  };

  const openMega = () => {
    if (closeTimer.current)
      clearTimeout(closeTimer.current);

    setShopOpen(true);
  };

  const scheduleCloseMega = () => {
    if (closeTimer.current)
      clearTimeout(closeTimer.current);

    closeTimer.current = setTimeout(
      () => setShopOpen(false),
      120,
    );
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-[100] border-b border-zinc-200/80 bg-white/95 backdrop-blur-md transition-all duration-300",
          scrolled &&
            "shadow-[0_4px_24px_rgba(0,0,0,0.05)]",
        )}
      >
        <nav
          className="mx-auto flex h-[62px] max-w-[1440px] items-center justify-between px-4 lg:px-8"
          aria-label="Main"
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex md:hidden"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-6 w-6 text-black" />
            </button>

            <Link
              href="/"
              className="font-display text-[24px] font-semibold tracking-[0.12em] text-black md:text-[28px]"
            >
              CLINVARA
            </Link>
          </div>

          <div className="hidden items-center gap-10 md:flex">
            <div
              className="relative"
              onMouseEnter={openMega}
              onMouseLeave={scheduleCloseMega}
            >
              <button
                type="button"
                className="nav-link-underline flex items-center gap-1 text-[12px] font-semibold uppercase tracking-[0.14em] text-black"
                aria-expanded={shopOpen}
                aria-haspopup="true"
                onClick={() =>
                  setShopOpen((v) => !v)
                }
              >
                Shop

                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            <Link
              href={
                isHome
                  ? "#best-sellers"
                  : "/shop?filter=bestsellers"
              }
              onClick={handleBestSellers}
              className="nav-link-underline text-[12px] font-semibold uppercase tracking-[0.14em] text-black"
            >
              Best Sellers
            </Link>

            <Link
              href="/routines"
              className="nav-link-underline text-[12px] font-semibold uppercase tracking-[0.14em] text-black"
            >
              Routines
            </Link>

            <Link
              href="/blog"
              className="nav-link-underline text-[12px] font-semibold uppercase tracking-[0.14em] text-black"
            >
              Blog
            </Link>

            <Link
              href="/track-order"
              className="nav-link-underline text-[12px] font-semibold uppercase tracking-[0.14em] text-black"
            >
              Track Order
            </Link>
          </div>

          <div className="flex items-center gap-5">
            <button
              type="button"
              aria-label="Search"
              className="text-black transition hover:opacity-60"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-[20px] w-[20px]" />
            </button>

            <button
              type="button"
              aria-label="Open account menu"
              aria-expanded={accountOpen}
              className="hidden text-black transition hover:opacity-60 sm:inline-flex"
              onClick={() => setAccountOpen(true)}
            >
              <User className="h-[20px] w-[20px]" />
            </button>

            <Link
              href="/account#wishlist"
              className="relative hidden text-black transition hover:opacity-60 sm:inline-flex"
              aria-label="Wishlist"
            >
              <Star className="h-[20px] w-[20px]" />

              {wishCount > 0 && (
                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-black" />
              )}
            </Link>

            <button
              type="button"
              aria-label="Open cart"
              className="relative text-black transition hover:opacity-60"
              onClick={() => openCart()}
            >
              <ShoppingBag className="h-[20px] w-[20px]" />

              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-semibold text-white">
                  {cartCount > 99
                    ? "99+"
                    : cartCount}
                </span>
              )}
            </button>
          </div>
        </nav>

        <div
          className="relative hidden md:block"
          onMouseEnter={openMega}
          onMouseLeave={scheduleCloseMega}
        >
          {shopOpen && (
            <div className="absolute left-0 right-0 top-0 border-b border-zinc-200 bg-white shadow-2xl">
              <div className="mx-auto grid max-w-[1440px] grid-cols-3 gap-14 px-10 py-10 lg:grid-cols-4">
                <div>
                  <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                    Skin &amp; Body
                  </p>

                  <ul className="space-y-3 text-[14px] font-medium text-zinc-800">
                    {shopColumns.skin.map((l) => (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          className="transition hover:text-black"
                          onClick={() =>
                            setShopOpen(false)
                          }
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                    Hair Care
                  </p>

                  <ul className="space-y-3 text-[14px] font-medium text-zinc-800">
                    {shopColumns.hair.map((l) => (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          className="transition hover:text-black"
                          onClick={() =>
                            setShopOpen(false)
                          }
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                    Shop by Concern
                  </p>

                  <ul className="space-y-3 text-[14px] font-medium text-zinc-800">
                    {shopColumns.concerns.map((l) => (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          className="transition hover:text-black"
                          onClick={() =>
                            setShopOpen(false)
                          }
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
                    className="hidden border border-zinc-200 bg-[#fafafa] p-5 transition-all duration-300 hover:border-black lg:block"
                    onClick={() =>
                      setShopOpen(false)
                    }
                  >
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                      Featured
                    </p>

                    <div className="relative mb-4 aspect-square bg-white">
                      <SafeImage
                        src={featured.image}
                        alt={featured.name}
                        label={featured.name}
                        fill
                        sizes="120px"
                        className="object-contain p-3"
                      />
                    </div>

                    <p className="text-[14px] font-semibold leading-snug tracking-tight text-black">
                      {featured.name}
                    </p>

                    <p className="mt-2 text-[14px] font-semibold text-black">
                      {formatINR(
                        featured.price,
                      )}
                    </p>

                    <span className="mt-4 inline-block text-[11px] font-semibold uppercase tracking-[0.14em] underline">
                      Shop Now
                    </span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <CartDrawer />

      <AccountMenu
        open={accountOpen}
        onClose={() =>
          setAccountOpen(false)
        }
      />

      <LoginModal />

      <SearchOverlay
        open={searchOpen}
        onClose={() =>
          setSearchOpen(false)
        }
      />
    </>
  );
}