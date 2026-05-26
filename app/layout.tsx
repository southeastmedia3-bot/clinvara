import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";

import "../styles/globals.css";

import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

import { ToastProvider } from "@/components/providers/ToastProvider";
import { ClientBootstrap } from "@/components/providers/ClientBootstrap";

import { ChatBot } from "@/components/ui/ChatBot";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CLINVARA | Clinical Skincare",
    template: "%s | CLINVARA",
  },

  description:
    "Science-backed, ingredient-transparent skincare. Dermatologist-tested formulas inspired by clinical simplicity.",

  metadataBase: new URL("https://clinvara.global"),

  manifest: "/manifest.json",

  openGraph: {
    title: "CLINVARA",
    description:
      "Clinical skincare with transparent ingredients.",
    siteName: "CLINVARA",
    type: "website",
    url: "https://clinvara.global",
  },

  twitter: {
    card: "summary_large_image",
    title: "CLINVARA",
    description:
      "Science-backed, ingredient-transparent skincare.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable}`}
    >
      <body className="font-body antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[300] focus:bg-black focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>

        <ToastProvider>
          <ClientBootstrap>
            <AnnouncementBar />
            <Navbar />

            <main id="main-content">
              {children}
            </main>

            <ChatBot />
            <Footer />
          </ClientBootstrap>
        </ToastProvider>
      </body>
    </html>
  );
}