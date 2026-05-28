import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "CLINVARA privacy policy covering account data, mobile OTP, social login, AI chat, ecommerce activity, and customer support.",
};

const sections = [
  {
    title: "Information We Collect",
    body: [
      "We collect information you provide when creating an account, signing in, contacting us, using the AI skincare assistant, saving products, or placing an order. This may include your name, email address, mobile number, country, account preferences, cart activity, wishlist activity, support messages, and login method.",
      "For mobile OTP login, we use Firebase Authentication to send and verify one-time passwords. For social sign-in, Google and Facebook may share profile information such as your name, email address, and account identifier after you approve the login.",
    ],
  },
  {
    title: "How We Use Information",
    body: [
      "We use your information to provide account access, authenticate sign-ins, personalize the shopping experience, maintain carts and wishlists, respond to support requests, improve website performance, and protect the website from fraud or abuse.",
      "If you use CLINVARA Assist, your chat message may be processed by our AI service provider to generate a response. Avoid sharing sensitive medical, financial, or personal information in chat.",
    ],
  },
  {
    title: "Payments and Orders",
    body: [
      "When payments are enabled, payment details are processed by payment providers and are not stored directly by CLINVARA in this website codebase. Order-related information may be used for checkout, delivery, returns, refunds, and customer support.",
    ],
  },
  {
    title: "Cookies and Similar Technologies",
    body: [
      "We may use cookies, local storage, and similar technologies to keep you signed in, remember cart and wishlist choices, measure website performance, and improve the shopping experience.",
    ],
  },
  {
    title: "Sharing of Information",
    body: [
      "We do not sell your personal information. We may share information with service providers who help us operate the website, including authentication providers, hosting providers, analytics tools, AI service providers, payment processors, logistics partners, and customer support tools.",
    ],
  },
  {
    title: "Data Security",
    body: [
      "We use reasonable technical and organizational measures to protect your information. No internet service is completely secure, so we recommend using strong passwords and protecting access to your email and mobile number.",
    ],
  },
  {
    title: "Your Choices",
    body: [
      "You may request access, correction, or deletion of your personal information by contacting us. You can also choose not to receive marketing updates where an unsubscribe or preference option is available.",
    ],
  },
  {
    title: "Children's Privacy",
    body: [
      "CLINVARA is intended for adults and is not directed to children. We do not knowingly collect personal information from children.",
    ],
  },
  {
    title: "Changes to This Policy",
    body: [
      "We may update this Privacy Policy as our website, services, or legal requirements change. The updated version will be posted on this page with a new effective date.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-text-muted)]">
        Legal
      </p>
      <h1 className="mt-3 font-display text-5xl font-semibold leading-tight">
        Privacy Policy
      </h1>
      <p className="mt-4 text-sm text-[var(--brand-text-muted)]">
        Effective date: May 22, 2026
      </p>
      <p className="mt-6 text-base leading-relaxed text-[var(--brand-text-muted)]">
        This Privacy Policy explains how CLINVARA collects, uses, shares, and
        protects information when you use our website, account features, mobile
        OTP login, social sign-in, AI assistant, contact forms, and ecommerce
        services.
      </p>

      <div className="mt-10 space-y-8">
        {sections.map((section) => (
          <section key={section.title} className="border-t border-[var(--brand-border)] pt-6">
            <h2 className="font-display text-2xl font-semibold">{section.title}</h2>
            <div className="mt-3 space-y-3">
              {section.body.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 48)}
                  className="text-sm leading-relaxed text-[var(--brand-text-muted)]"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-10 rounded-2xl bg-[var(--brand-off-white)] p-6">
        <h2 className="font-display text-2xl font-semibold">Contact</h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--brand-text-muted)]">
          For privacy questions or requests, contact us through the{" "}
          <Link href="/contact" className="font-semibold text-black underline">
            Contact Us
          </Link>{" "}
          page or email{" "}
          <a href="mailto:clinvaraglobal@gmail.com" className="font-semibold text-black underline">
            clinvaraglobal@gmail.com
          </a>
          .
        </p>
      </section>
    </main>
  );
}
