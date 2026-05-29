import type { Metadata } from "next";
import { ContactClient } from "@/app/contact/ContactClient";

export const metadata: Metadata = {
  title: { absolute: "Contact Us | CLINVARA" },
  description:
    "Contact CLINVARA for product, ingredient, order, wholesale, and customer support questions.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Us | CLINVARA",
    description: "Reach CLINVARA customer support for product, order, and ingredient questions.",
    url: "/contact",
    images: ["/images/brand/clinvara-logo.png"],
  },
  twitter: {
    title: "Contact Us | CLINVARA",
    description: "Reach CLINVARA customer support for product, order, and ingredient questions.",
    images: ["/images/brand/clinvara-logo.png"],
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
