import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "CLINVARA privacy policy covering account data, mobile OTP, social login, AI chat, ecommerce activity, cookies, retention, rights, and grievance contact.",
};

const sections = [
  {
    title: "Scope of this Policy",
    body: [
      "This Privacy Policy applies to personal information processed through the CLINVARA website, account features, mobile OTP login, social sign-in, AI skincare assistant, contact forms, cart, wishlist, order-related services, and customer support channels.",
      "This policy is prepared for an India-focused ecommerce experience and is intended to align with principles reflected in the Digital Personal Data Protection Act, 2023, including notice, consent, purpose limitation, reasonable security safeguards, and grievance redressal.",
    ],
  },
  {
    title: "Information We Collect",
    body: [
      "Account and profile information: name, email address, mobile number, country, login method, preferences, and customer support details.",
      "Ecommerce activity: cart items, wishlist products, routine interests, order identifiers, delivery information, transaction status, returns or refund requests, and customer care messages.",
      "Authentication information: Firebase phone OTP events, Google or Facebook profile identifiers, and sign-in session data. We do not ask you to share OTPs with customer support.",
      "AI assistant messages: prompts and conversation context you submit to CLINVARA Assist so the assistant can generate a response.",
      "Technical information: device/browser details, pages visited, approximate location derived from network data, cookies, local storage, and usage logs needed for security, analytics, and performance.",
    ],
  },
  {
    title: "How We Use Personal Information",
    body: [
      "We use personal information to create and secure accounts, verify mobile OTPs, enable social login, maintain carts and wishlists, provide order support, respond to enquiries, process eligible returns and refunds, improve website performance, and protect against fraud or misuse.",
      "We may use contact details to send transactional updates about accounts, orders, support requests, OTPs, and policy changes. Marketing updates are sent only where permitted by law and your preferences.",
      "AI assistant messages may be processed by our AI service provider to generate answers. Do not submit sensitive medical, financial, payment, identity, or highly personal information in the chat.",
    ],
  },
  {
    title: "Legal Basis and Consent",
    body: [
      "Where required, we process personal information with your consent, including for account creation, mobile OTP login, marketing preferences, and optional AI assistant use.",
      "We may also process information for legitimate ecommerce purposes such as fulfilling orders, preventing fraud, keeping records, resolving disputes, complying with applicable law, and responding to customer requests.",
      "You may withdraw optional consent by contacting us or using available preference controls. Withdrawal may affect features that require the relevant information.",
    ],
  },
  {
    title: "Sharing and Service Providers",
    body: [
      "We do not sell your personal information. We share information only where necessary with service providers who help operate the website and services, including Firebase, hosting providers, payment processors, courier/logistics partners, analytics tools, AI service providers, email/SMS providers, and customer support tools.",
      "Service providers are expected to process information for the services they provide to CLINVARA and maintain appropriate safeguards.",
    ],
  },
  {
    title: "Payments",
    body: [
      "When payment services are enabled, payment information is processed by payment gateway or banking partners. CLINVARA should not store full card numbers, CVV, UPI PINs, or net banking credentials in the website codebase.",
      "Payment status, transaction references, refund status, and invoice information may be retained for accounting, customer support, compliance, and dispute resolution.",
    ],
  },
  {
    title: "Cookies and Local Storage",
    body: [
      "We use cookies, local storage, and similar technologies to keep you signed in, remember cart and wishlist choices, support account flows, measure site performance, and improve customer experience.",
      "You can manage cookies through your browser settings. Blocking some cookies may affect account, cart, wishlist, or checkout functionality.",
    ],
  },
  {
    title: "Retention",
    body: [
      "We retain personal information only for as long as reasonably necessary for the purposes described in this policy, including account management, order records, legal obligations, fraud prevention, support history, tax/accounting records, and dispute resolution.",
      "When information is no longer required, we aim to delete, anonymize, or securely restrict it in accordance with applicable requirements and operational needs.",
    ],
  },
  {
    title: "Security",
    body: [
      "We use reasonable technical and organizational safeguards to protect personal information. No internet service is completely secure, so customers should use strong passwords, protect mobile OTPs, and keep email and social accounts secure.",
      "If we become aware of a data incident that requires notification under applicable law, we will take steps required by law and cooperate with relevant processes.",
    ],
  },
  {
    title: "Your Rights and Choices",
    body: [
      "Subject to applicable law, you may request access, correction, updating, deletion, or grievance redressal regarding your personal information.",
      "You may opt out of marketing communications where an unsubscribe or preference option is available. Transactional messages such as OTPs, order updates, and support responses may still be sent where necessary.",
    ],
  },
  {
    title: "Children's Privacy",
    body: [
      "CLINVARA is intended for adults and is not directed to children. We do not knowingly collect personal information from children. If you believe a child has provided information, contact us so we can review and take appropriate action.",
    ],
  },
  {
    title: "Changes to this Policy",
    body: [
      "We may update this Privacy Policy as the website, services, legal requirements, or business operations change. The updated version will be posted on this page with a revised effective date.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-text-muted)]">
        Legal
      </p>
      <h1 className="mt-3 font-display text-5xl font-semibold leading-tight">
        Privacy Policy
      </h1>
      <p className="mt-4 text-sm text-[var(--brand-text-muted)]">
        Effective date: May 25, 2026
      </p>
      <p className="mt-6 max-w-3xl text-base leading-relaxed text-[var(--brand-text-muted)]">
        This policy explains how CLINVARA collects, uses, shares, retains, and
        protects personal information when you use our website and ecommerce
        services.
      </p>

      <div className="mt-10 space-y-8">
        {sections.map((section) => (
          <section key={section.title} className="border-t border-[var(--brand-border)] pt-6">
            <h2 className="font-display text-2xl font-semibold">{section.title}</h2>
            <div className="mt-3 space-y-3">
              {section.body.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 58)}
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
        <h2 className="font-display text-2xl font-semibold">Privacy and Grievance Contact</h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--brand-text-muted)]">
          For privacy questions, correction/deletion requests, or grievance
          redressal, contact us through the{" "}
          <Link href="/contact" className="font-semibold text-black underline">
            Contact Us
          </Link>{" "}
          page or email{" "}
          <a href="mailto:help@clinvara.com" className="font-semibold text-black underline">
            help@clinvara.com
          </a>
          . We aim to acknowledge customer grievances within 48 hours and work
          toward resolution within one month, where feasible and applicable.
        </p>
      </section>
    </main>
  );
}
