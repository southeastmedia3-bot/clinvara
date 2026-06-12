export default function WhyChooseClinvara() {
  return (
    <section className="bg-[var(--brand-cream)] px-4 py-16 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        <h2 className="font-display text-3xl font-semibold md:text-4xl">
          Why Choose CLINVARA
        </h2>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <div>
            <h3 className="font-semibold">Dermatologist-Tested</h3>
            <p className="mt-2 text-sm text-[var(--brand-text-muted)]">
              Carefully developed for everyday skincare routines.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">Clinical Actives</h3>
            <p className="mt-2 text-sm text-[var(--brand-text-muted)]">
              Powered by ingredients backed by scientific research.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">Barrier Focused</h3>
            <p className="mt-2 text-sm text-[var(--brand-text-muted)]">
              Supports long-term skin health and resilience.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">Indian Skin Concerns</h3>
            <p className="mt-2 text-sm text-[var(--brand-text-muted)]">
              Designed for pigmentation, uneven tone and dehydration.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">Transparent Formulas</h3>
            <p className="mt-2 text-sm text-[var(--brand-text-muted)]">
              Clear ingredient communication and simple routines.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}