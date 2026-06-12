export default function FaqSection() {
  const faqs = [
    {
      question: "What is clinical skincare?",
      answer:
        "Clinical skincare uses scientifically researched ingredients and dermatologist-tested formulations to address specific skin concerns such as pigmentation, dehydration and skin barrier damage.",
    },
    {
      question: "What does niacinamide do for skin?",
      answer:
        "Niacinamide helps improve uneven skin tone, reduce the appearance of enlarged pores, support the skin barrier and balance excess oil production.",
    },
    {
      question: "How do ceramides help the skin barrier?",
      answer:
        "Ceramides are lipids naturally found in the skin. They help strengthen the skin barrier, reduce moisture loss and improve overall skin resilience.",
    },
    {
      question: "Which Clinvara products help pigmentation?",
      answer:
        "Products containing niacinamide and targeted pigmentation ingredients can help improve the appearance of dark spots and uneven skin tone over time.",
    },
    {
      question: "Can sensitive skin use niacinamide?",
      answer:
        "Niacinamide is generally well tolerated by most skin types, including sensitive skin, when introduced gradually into a skincare routine.",
    },
    {
      question: "How often should I use active ingredients?",
      answer:
        "Usage depends on the ingredient and skin type. Following product directions and building a consistent routine is recommended.",
    },
  ];

  return (
    <section className="bg-[var(--brand-cream)] px-4 py-16 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-display text-3xl font-semibold md:text-4xl">
          Frequently Asked Questions
        </h2>

        <div className="mt-8 space-y-8">
          {faqs.map((faq) => (
            <div key={faq.question}>
              <h3 className="text-lg font-semibold">
                {faq.question}
              </h3>

              <p className="mt-2 leading-7 text-[var(--brand-text-muted)]">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}