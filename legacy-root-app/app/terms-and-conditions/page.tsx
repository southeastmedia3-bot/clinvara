import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Terms and conditions for using CLINVARA website and services.",
};

const sections = [
  ["Use of Website", "By using CLINVARA, you agree to use the website lawfully and not interfere with its security, availability, or customer experience."],
  ["Account Responsibility", "You are responsible for keeping your login details, email, mobile number, and OTP access secure. Notify us if you suspect unauthorized access."],
  ["Product Information", "We aim to keep product information accurate, but packaging, pricing, availability, and ingredient details may change. Always read product labels before use."],
  ["Skincare Guidance", "Website content and AI chat responses are for general information only. They are not medical advice and do not replace a dermatologist or healthcare professional."],
  ["Orders and Payments", "Orders are subject to acceptance, payment confirmation, stock availability, and delivery serviceability. We may cancel or refund orders where required."],
  ["Limitation of Liability", "To the extent permitted by law, CLINVARA is not liable for indirect, incidental, or consequential losses from website use or product misuse."],
];

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-text-muted)]">
        Legal
      </p>
      <h1 className="mt-3 font-display text-5xl font-semibold">Terms and Conditions</h1>
      <p className="mt-4 text-sm text-[var(--brand-text-muted)]">Effective date: May 22, 2026</p>
      <div className="mt-10 space-y-6">
        {sections.map(([title, body]) => (
          <section key={title} className="border-t border-[var(--brand-border)] pt-6">
            <h2 className="font-display text-2xl font-semibold">{title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--brand-text-muted)]">{body}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
