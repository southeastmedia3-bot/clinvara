import Link from "next/link";
import { Mail, Facebook, Instagram, Youtube } from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-[var(--brand-border)]">
      <div className="bg-[var(--brand-light-gray)] px-4 py-3 text-center text-xs text-[var(--brand-text-muted)]">
        Prices are inclusive of all applicable taxes. MRP includes GST as per
        Indian regulations.
      </div>

      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-12 md:grid-cols-2 lg:grid-cols-5 lg:px-8">
        <div className="lg:col-span-1">
          <Link href="/" aria-label="CLINVARA home" className="inline-flex h-20 w-36">
            <BrandLogo className="h-full w-full" />
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-[var(--brand-text-muted)]">
            Science-backed skincare formulated with clinical transparency. Every
            formula lists what matters-and nothing you don&apos;t need.
          </p>
          <p className="mt-4 text-xs font-medium text-[var(--brand-text-muted)]">
            Dermatologist Tested - Vegan - Cruelty Free
          </p>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold">Company</p>
          <ul className="space-y-2 text-sm text-[var(--brand-text-muted)]">
            <li>
              <Link href="/about-us" className="hover:text-black">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/our-values" className="hover:text-black">
                Our Values
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="hover:text-black">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms-and-conditions" className="hover:text-black">
                Terms &amp; Conditions
              </Link>
            </li>
            <li>
              <Link href="/sustainability" className="hover:text-black">
                Sustainability
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold">Quick Links</p>
          <ul className="space-y-2 text-sm text-[var(--brand-text-muted)]">
            <li>
              <Link href="/blog" className="hover:text-black">
                Blog / Knowledge Base
              </Link>
            </li>
            <li>
              <Link href="/faqs" className="hover:text-black">
                FAQs
              </Link>
            </li>
            <li>
              <Link href="/shipping-policy" className="hover:text-black">
                Shipping Policy
              </Link>
            </li>
            <li>
              <Link href="/return-refund-policy" className="hover:text-black">
                Return &amp; Refund Policy
              </Link>
            </li>
            <li>
              <Link href="/track-order" className="hover:text-black">
                Track My Order
              </Link>
            </li>
            <li>
              <Link href="/careers" className="hover:text-black">
                Careers
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold">Contact Us</p>
          <p className="text-sm text-[var(--brand-text-muted)]">
            Have a question? We&apos;d love to help.
          </p>
          <p className="mt-3 text-sm">
            <a
              href="mailto:clinvaraglobal@gmail.com"
              className="hover:text-[var(--brand-accent)]"
            >
              clinvaraglobal@gmail.com
            </a>
          </p>
          <p className="mt-1 text-sm">
            <a
              href="mailto:clinvaraglobal@gmail.com"
              className="hover:text-[var(--brand-accent)]"
            >
              clinvaraglobal@gmail.com
            </a>
          </p>
          <Link
            href="/contact"
            className="mt-3 inline-block text-sm font-semibold underline"
          >
            Fill out our Contact Form -&gt;
          </Link>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold">Follow Us</p>
          <div className="flex gap-4">
            <a
              href="mailto:clinvaraglobal@gmail.com"
              aria-label="Email"
              className="text-[var(--brand-primary)] hover:text-[var(--brand-accent)]"
            >
              <Mail className="h-6 w-6" />
            </a>
            <a
              href="https://facebook.com"
              aria-label="Facebook"
              className="text-[var(--brand-primary)] hover:text-[var(--brand-accent)]"
            >
              <Facebook className="h-6 w-6" />
            </a>
            <a
              href="https://instagram.com"
              aria-label="Instagram"
              className="text-[var(--brand-primary)] hover:text-[var(--brand-accent)]"
            >
              <Instagram className="h-6 w-6" />
            </a>
            <a
              href="https://youtube.com"
              aria-label="YouTube"
              className="text-[var(--brand-primary)] hover:text-[var(--brand-accent)]"
            >
              <Youtube className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--brand-border)]">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 px-4 py-6 text-xs text-[var(--brand-text-muted)] md:flex-row lg:px-8">
          <p>
            Copyright 2026 <strong className="font-bold text-black">CLINVARA</strong>.
            All rights reserved.
          </p>
          <div className="flex items-center gap-3" aria-label="Payment methods">
            <span className="rounded border px-2 py-1 font-semibold">VISA</span>
            <span className="rounded border px-2 py-1 font-semibold">MC</span>
            <span className="rounded border px-2 py-1 font-semibold">UPI</span>
            <span className="rounded border px-2 py-1 font-semibold">
              Razorpay
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
