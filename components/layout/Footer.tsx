import Link from "next/link";
import { Mail, Facebook, Instagram, Youtube } from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-black text-white">
      <div className="border-b border-white/10 bg-zinc-950 px-4 py-3 text-center text-xs text-white/60">
        Prices are inclusive of all applicable taxes. MRP includes GST as per
        Indian regulations.
      </div>

      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-12 md:grid-cols-2 lg:grid-cols-5 lg:px-8">
        <div className="lg:col-span-1">
          <Link
            href="/"
            aria-label="CLINVARA home"
            className="inline-flex h-20 w-36"
          >
            <BrandLogo className="h-full w-full invert" />
          </Link>

          <p className="mt-3 text-sm leading-relaxed text-white/70">
            Science-backed skincare formulated with clinical transparency. Every
            formula lists what matters-and nothing you don&apos;t need.
          </p>

          <p className="mt-4 text-xs font-medium text-white/60">
            Dermatologist Tested - Vegan - Cruelty Free
          </p>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-white">
            Company
          </p>

          <ul className="space-y-2 text-sm text-white/70">
            <li>
              <Link href="/about-us" className="transition hover:text-white">
                About Us
              </Link>
            </li>

            <li>
              <Link href="/our-values" className="transition hover:text-white">
                Our Values
              </Link>
            </li>

            <li>
              <Link
                href="/privacy-policy"
                className="transition hover:text-white"
              >
                Privacy Policy
              </Link>
            </li>

            <li>
              <Link
                href="/terms-and-conditions"
                className="transition hover:text-white"
              >
                Terms &amp; Conditions
              </Link>
            </li>

            <li>
              <Link
                href="/sustainability"
                className="transition hover:text-white"
              >
                Sustainability
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-white">
            Quick Links
          </p>

          <ul className="space-y-2 text-sm text-white/70">
            <li>
              <Link href="/blog" className="transition hover:text-white">
                Blog / Knowledge Base
              </Link>
            </li>

            <li>
              <Link href="/faqs" className="transition hover:text-white">
                FAQs
              </Link>
            </li>

            <li>
              <Link
                href="/shipping-policy"
                className="transition hover:text-white"
              >
                Shipping Policy
              </Link>
            </li>

            <li>
              <Link
                href="/return-refund-policy"
                className="transition hover:text-white"
              >
                Return &amp; Refund Policy
              </Link>
            </li>

            <li>
              <Link
                href="/track-order"
                className="transition hover:text-white"
              >
                Track My Order
              </Link>
            </li>

            <li>
              <Link href="/careers" className="transition hover:text-white">
                Careers
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-white">
            Contact Us
          </p>

          <p className="text-sm text-white/70">
            Have a question? We&apos;d love to help.
          </p>

          <p className="mt-3 text-sm">
            <a
              href="mailto:help@clinvara.com"
              className="text-white/80 transition hover:text-white"
            >
              help@clinvara.com
            </a>
          </p>

          <p className="mt-1 text-sm">
            <a
              href="mailto:gifting@clinvara.com"
              className="text-white/80 transition hover:text-white"
            >
              gifting@clinvara.com
            </a>
          </p>

          <Link
            href="/contact"
            className="mt-3 inline-block text-sm font-semibold underline transition hover:text-white/80"
          >
            Fill out our Contact Form -&gt;
          </Link>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-white">
            Follow Us
          </p>

          <div className="flex gap-4">
            <a
              href="mailto:help@clinvara.com"
              aria-label="Email"
              className="text-white/70 transition hover:text-white"
            >
              <Mail className="h-6 w-6" />
            </a>

            <a
              href="https://facebook.com"
              aria-label="Facebook"
              className="text-white/70 transition hover:text-white"
            >
              <Facebook className="h-6 w-6" />
            </a>

            <a
              href="https://instagram.com"
              aria-label="Instagram"
              className="text-white/70 transition hover:text-white"
            >
              <Instagram className="h-6 w-6" />
            </a>

            <a
              href="https://youtube.com"
              aria-label="YouTube"
              className="text-white/70 transition hover:text-white"
            >
              <Youtube className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 px-4 py-6 text-xs text-white/60 md:flex-row lg:px-8">
          <p>
            Copyright 2026{" "}
            <strong className="font-bold text-white">
              CLINVARA
            </strong>. All rights reserved.
          </p>

          <div
            className="flex items-center gap-3"
            aria-label="Payment methods"
          >
            <span className="rounded border border-white/20 bg-zinc-900 px-2 py-1 font-semibold text-white">
              VISA
            </span>

            <span className="rounded border border-white/20 bg-zinc-900 px-2 py-1 font-semibold text-white">
              MC
            </span>

            <span className="rounded border border-white/20 bg-zinc-900 px-2 py-1 font-semibold text-white">
              UPI
            </span>

            <span className="rounded border border-white/20 bg-zinc-900 px-2 py-1 font-semibold text-white">
              Razorpay
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}