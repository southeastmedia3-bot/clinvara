import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";

import "../styles/globals.css";

import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AdminChromeHider } from "@/components/layout/AdminChromeHider";

import { ToastProvider } from "@/components/providers/ToastProvider";
import { ClientBootstrap } from "@/components/providers/ClientBootstrap";

import { ChatBot } from "@/components/ui/ChatBot";
import GoogleAnalytics from "@/components/shared/GoogleAnalytics";
import { getStoreSettings } from "@/lib/firebase/products";

const siteUrl = "https://clinvara.global";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default:
      "Clinical Skincare Products | Dermatologist-Tested Skin Care | CLINVARA",
    template: "%s | CLINVARA",
  },

  description:
    "Discover dermatologist-tested clinical skincare powered by active ingredients for pigmentation, hydration, oil control and skin barrier repair.",

  applicationName: "CLINVARA",

  keywords: [
    "clinical skincare",
    "dermatologist tested skincare",
    "niacinamide serum",
    "ceramide moisturizer",
    "pigmentation skincare",
    "skin barrier repair",
    "oily skin skincare",
    "clinical actives skincare",
    "skincare for pigmentation",
    "sensitive skin skincare",
  ],

  authors: [{ name: "CLINVARA" }],
  creator: "CLINVARA",
  publisher: "CLINVARA",

  alternates: {
    canonical: "/",
  },

  manifest: "/manifest.json",

  verification: {
    google: "K6c6ABaXQyQ9BPRbTYXGB-pnpFSCYbxOg52YarzGJFE",
  },

  openGraph: {
    title:
      "Clinical Skincare Products | Dermatologist-Tested Skin Care | CLINVARA",
    description:
      "Dermatologist-tested clinical skincare powered by active ingredients for pigmentation, hydration, oil control and skin barrier repair.",
    siteName: "CLINVARA",
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    images: [
      {
        url: "/images/brand/clinvara-logo.png",
        width: 1200,
        height: 630,
        alt: "CLINVARA clinical skincare",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title:
      "Clinical Skincare Products | Dermatologist-Tested Skin Care | CLINVARA",
    description:
      "Science-backed, ingredient-transparent skincare powered by clinical actives.",
    images: ["/images/brand/clinvara-logo.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "CLINVARA",
  url: siteUrl,
  logo: `${siteUrl}/images/brand/clinvara-logo.png`,
  description:
    "Clinical skincare powered by active ingredients and dermatologist-tested formulations.",
  sameAs: [
    "https://www.instagram.com/clinvaraglobal/",
    "https://www.threads.com/@clinvaraglobal",
  ],
  brand: {
    "@type": "Brand",
    name: "CLINVARA",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "CLINVARA",
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/shop?search={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getStoreSettings();
  const announcementText = settings.announcementBarText?.trim();
  const announcementItems = announcementText
    ? [{ text: announcementText, href: "/shop" }]
    : undefined;

  return (
    <html lang="en-IN" className={`${display.variable} ${body.variable}`}>
      <body className="font-body antialiased">
        <GoogleAnalytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />

        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[300] focus:bg-black focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>

        <ToastProvider>
          <ClientBootstrap>
            <AdminChromeHider />
            <div data-store-chrome>
              <AnnouncementBar initialAnnouncements={announcementItems} />
              <Navbar />
            </div>

            <main id="main-content">{children}</main>

            <div data-store-chrome>
              <ChatBot />
              <Footer />
            </div>
          </ClientBootstrap>
        </ToastProvider>
      </body>
    </html>
  );
}