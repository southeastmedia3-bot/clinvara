"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, RotateCcw, Sparkles } from "lucide-react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { useAuthStore } from "@/lib/store/authStore";
import { useCartStore } from "@/lib/store/cartStore";
import { useToast } from "@/components/providers/ToastProvider";
import { readCustomerProfile, saveCustomerProfile } from "@/lib/firebase/customerData";
import { isOutOfStock } from "@/lib/productAvailability";
import type { Product } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import {
  buildSkinAnalysisResult,
  emptySkinAnalysisAnswers,
  isStepAnswered,
  optionLabel,
  skinAnalysisQuestions,
  type SkinAnalysisAnswers,
  type SkinAnalysisQuestion,
  type SkinAnalysisRecord,
  type SkinConcern,
} from "@/lib/skin-analysis/recommendations";

const STORAGE_KEY = "clinvara-skin-analysis";

const analysisSteps = [
  "Understanding Skin Profile",
  "Matching Skin Concerns",
  "Selecting Ingredients",
  "Building Personalized Routine",
  "Preparing Product Recommendations",
];

function money(value: number) {
  return formatINR(value);
}

function routineProducts(products: Product[], slugs: string[]) {
  return slugs
    .map((slug) => products.find((product) => product.slug === slug))
    .filter(Boolean) as Product[];
}

function QuestionOption({
  selected,
  children,
  onClick,
}: {
  selected: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`rounded-2xl border px-4 py-4 text-left text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-black/20 ${
        selected
          ? "border-black bg-black text-white shadow-lg"
          : "border-[var(--brand-border)] bg-white text-black hover:border-black hover:bg-[var(--brand-off-white)]"
      }`}
    >
      {children}
    </button>
  );
}

function RoutineList({ title, steps }: { title: string; steps: SkinAnalysisRecord["result"]["morningRoutine"] }) {
  return (
    <section className="rounded-3xl border border-[var(--brand-border)] bg-white p-5 md:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-text-muted)]">
        {title}
      </p>
      <ol className="mt-5 space-y-4">
        {steps.map((step, index) => (
          <li key={`${step.slug}-${title}`} className="flex gap-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-black text-xs font-semibold text-white">
              {index + 1}
            </span>
            <div>
              <Link href={`/shop/${step.slug}`} className="font-display text-xl font-semibold hover:underline">
                {step.label}
              </Link>
              <p className="mt-1 text-sm leading-6 text-[var(--brand-text-muted)]">
                {step.note}
              </p>
              {index < steps.length - 1 && (
                <span className="mt-3 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-mid-gray)]">
                  Then
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function SkinAnalysisClient({ products }: { products: Product[] }) {
  const user = useAuthStore((state) => state.user);
  const addItem = useCartStore((state) => state.addItem);
  const { showToast } = useToast();

  const [answers, setAnswers] = useState<SkinAnalysisAnswers>(emptySkinAnalysisAnswers);
  const [stepIndex, setStepIndex] = useState(0);
  const [stage, setStage] = useState<"quiz" | "analyzing" | "results">("quiz");
  const [record, setRecord] = useState<SkinAnalysisRecord | null>(null);
  const [previousRecord, setPreviousRecord] = useState<SkinAnalysisRecord | null>(null);

  const question = skinAnalysisQuestions[stepIndex];
  const progress = ((stepIndex + 1) / skinAnalysisQuestions.length) * 100;
  const result = record?.result;
  const recommendedProducts = useMemo(
    () => (result ? routineProducts(products, result.recommendedProductSlugs) : []),
    [products, result],
  );
  const combinedPrice = recommendedProducts.reduce((sum, product) => sum + product.price, 0);
  const combinedMrp = recommendedProducts.reduce((sum, product) => sum + product.mrp, 0);
  const savings = Math.max(0, combinedMrp - combinedPrice);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setPreviousRecord(JSON.parse(stored) as SkinAnalysisRecord);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (!user?.uid) return;

    let active = true;
    void readCustomerProfile(user.uid).then((profile) => {
      if (!active) return;
      const latest = profile?.skinAnalysis?.latest;
      if (latest) setPreviousRecord(latest);
    });

    return () => {
      active = false;
    };
  }, [user?.uid]);

  function setSingleAnswer(id: SkinAnalysisQuestion["id"], value: string) {
    setAnswers((current) => ({
      ...current,
      [id]: value,
    }));
  }

  function toggleConcern(value: SkinConcern) {
    setAnswers((current) => {
      const exists = current.concerns.includes(value);
      return {
        ...current,
        concerns: exists
          ? current.concerns.filter((concern) => concern !== value)
          : [...current.concerns, value],
      };
    });
  }

  function goNext() {
    if (!isStepAnswered(answers, question)) {
      showToast({ message: "Choose an answer to continue.", variant: "info" });
      return;
    }

    if (stepIndex < skinAnalysisQuestions.length - 1) {
      setStepIndex((current) => current + 1);
      return;
    }

    setStage("analyzing");
    window.setTimeout(() => {
      const nextRecord: SkinAnalysisRecord = {
        answers,
        result: buildSkinAnalysisResult(answers),
        completedAt: new Date().toISOString(),
      };

      setRecord(nextRecord);
      setPreviousRecord(nextRecord);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRecord));

      if (user?.uid) {
        void saveCustomerProfile(user.uid, {
          skinAnalysis: {
            latest: nextRecord,
            history: [nextRecord],
          },
        });
      }

      setStage("results");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 2400);
  }

  function retake() {
    setAnswers(emptySkinAnalysisAnswers);
    setStepIndex(0);
    setRecord(null);
    setStage("quiz");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function viewPrevious() {
    if (!previousRecord) return;
    setRecord(previousRecord);
    setAnswers(previousRecord.answers);
    setStage("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function addRoutineToCart() {
    const available = recommendedProducts.filter((product) => !isOutOfStock(product));
    if (!available.length) {
      showToast({ message: "Routine products are currently out of stock.", variant: "info" });
      return;
    }

    available.forEach((product) => {
      addItem({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.image,
        size: product.sizes[0] ?? "Default",
        price: product.price,
        quantity: 1,
        dispatchTimeDays: product.dispatchTimeDays ?? 1,
      });
    });

    const skipped = recommendedProducts.length - available.length;
    showToast({
      message: skipped
        ? "Available routine products were added. Out-of-stock items were skipped."
        : "Complete routine added to cart.",
      variant: "success",
    });
  }

  return (
    <main className="bg-[#f7f5f2]">
      <section className="mx-auto grid max-w-[1440px] gap-8 px-4 py-12 md:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-16">
        <div className="rounded-[2rem] border border-[var(--brand-border)] bg-white p-6 shadow-sm md:p-8 lg:sticky lg:top-28 lg:self-start">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-text-muted)]">
            Skin Analysis
          </p>
          <h1 className="mt-4 font-display text-5xl font-medium leading-none md:text-6xl">
            Routine Builder
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-[var(--brand-text-muted)]">
            Get a personalized skincare routine tailored to your skin type, concerns,
            sensitivity, and lifestyle in under 2 minutes.
          </p>

          <div className="mt-8 grid gap-3 text-sm">
            {["Personalized Routine", "Dermatologist-Inspired Recommendations", "Takes Less Than 2 Minutes"].map(
              (item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-black text-white">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className="font-medium">{item}</span>
                </div>
              ),
            )}
          </div>

          {previousRecord && stage === "quiz" && (
            <button
              type="button"
              onClick={viewPrevious}
              className="mt-8 w-full rounded-full border border-black px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] transition hover:bg-black hover:text-white"
            >
              View Previous Analysis
            </button>
          )}
        </div>

        <div className="min-h-[620px] rounded-[2rem] border border-[var(--brand-border)] bg-white p-5 shadow-sm md:p-8">
          {stage === "quiz" && (
            <section aria-labelledby="skin-analysis-question">
              <div className="flex flex-col gap-4 border-b border-[var(--brand-border)] pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-text-muted)]">
                    Question {stepIndex + 1} of {skinAnalysisQuestions.length}
                  </p>
                  <h2 id="skin-analysis-question" className="mt-2 font-display text-3xl font-semibold md:text-4xl">
                    {question.title}
                  </h2>
                  {question.helper && (
                    <p className="mt-2 text-sm text-[var(--brand-text-muted)]">
                      {question.helper}
                    </p>
                  )}
                </div>
                <span className="rounded-full border border-[var(--brand-border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em]">
                  {Math.round(progress)}%
                </span>
              </div>

              <div className="mt-6 h-2 overflow-hidden rounded-full bg-[var(--brand-light-gray)]">
                <div className="h-full rounded-full bg-black transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {question.options.map((option) => {
                  const selected =
                    question.type === "multi"
                      ? answers.concerns.includes(option.value as SkinConcern)
                      : answers[question.id] === option.value;

                  return (
                    <QuestionOption
                      key={option.value}
                      selected={selected}
                      onClick={() =>
                        question.type === "multi"
                          ? toggleConcern(option.value as SkinConcern)
                          : setSingleAnswer(question.id, option.value)
                      }
                    >
                      {option.label}
                    </QuestionOption>
                  );
                })}
              </div>

              <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
                  disabled={stepIndex === 0}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[var(--brand-border)] px-5 text-xs font-semibold uppercase tracking-[0.14em] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-black px-6 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-white hover:text-black hover:ring-1 hover:ring-black"
                >
                  {stepIndex === skinAnalysisQuestions.length - 1 ? "Build Routine" : "Next"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </section>
          )}

          {stage === "analyzing" && (
            <section className="flex min-h-[560px] flex-col items-center justify-center text-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-black text-white">
                <Sparkles className="h-7 w-7" />
              </span>
              <h2 className="mt-6 font-display text-4xl font-semibold">
                Analyzing Your Skin...
              </h2>
              <div className="mt-8 w-full max-w-md space-y-3 text-left">
                {analysisSteps.map((step, index) => (
                  <div
                    key={step}
                    className="flex items-center gap-3 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-off-white)] px-4 py-3"
                    style={{ animationDelay: `${index * 180}ms` }}
                  >
                    <Check className="h-4 w-4 text-[var(--brand-green-check)]" />
                    <span className="text-sm font-medium">{step}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {stage === "results" && record && result && (
            <section>
              <div className="flex flex-col gap-4 border-b border-[var(--brand-border)] pb-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-text-muted)]">
                    Your Skin Profile
                  </p>
                  <h2 className="mt-2 font-display text-4xl font-semibold md:text-5xl">
                    {result.profileTitle}
                  </h2>
                  <p className="mt-3 text-sm text-[var(--brand-text-muted)]">
                    Completed {new Date(record.completedAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={retake}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-black px-4 text-xs font-semibold uppercase tracking-[0.14em] transition hover:bg-black hover:text-white"
                >
                  <RotateCcw className="h-4 w-4" />
                  Retake Analysis
                </button>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {result.primaryConcerns.map((concern) => (
                  <span
                    key={concern}
                    className="rounded-full border border-[var(--brand-border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em]"
                  >
                    {concern}
                  </span>
                ))}
              </div>

              <div className="mt-8 grid gap-5 lg:grid-cols-2">
                <RoutineList title="Morning Routine" steps={result.morningRoutine} />
                <RoutineList title="Night Routine" steps={result.nightRoutine} />
              </div>

              <section className="mt-8 rounded-3xl border border-[var(--brand-border)] bg-[var(--brand-off-white)] p-5 md:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-text-muted)]">
                  Additional Recommendations
                </p>
                <ul className="mt-4 space-y-3">
                  {result.tips.map((tip) => (
                    <li key={tip} className="flex gap-3 text-sm leading-6">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-[var(--brand-green-check)]" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {recommendedProducts.length > 0 && (
                <section className="mt-10">
                  <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-text-muted)]">
                        Recommended Products
                      </p>
                      <h3 className="mt-2 font-display text-3xl font-semibold">
                        Your CLINVARA Routine
                      </h3>
                    </div>
                    <Link href="/shop" className="text-sm font-semibold underline">
                      Explore all products
                    </Link>
                  </div>
                  <ProductGrid products={recommendedProducts} mobileColumns={1} />
                </section>
              )}

              <section className="mt-10 rounded-3xl border border-black bg-black p-6 text-white md:p-8">
                <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                      Recommended Routine
                    </p>
                    <h3 className="mt-2 font-display text-3xl font-semibold">
                      Complete routine value: {money(combinedPrice)}
                    </h3>
                    <p className="mt-2 text-sm text-white/70">
                      Estimated savings: {money(savings)} compared with MRP.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addRoutineToCart}
                    className="h-12 rounded-full bg-white px-6 text-xs font-semibold uppercase tracking-[0.14em] text-black transition hover:bg-[var(--brand-accent)]"
                  >
                    Add Entire Routine to Cart
                  </button>
                </div>
              </section>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
