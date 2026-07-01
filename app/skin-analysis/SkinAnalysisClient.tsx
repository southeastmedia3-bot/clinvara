"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, RotateCcw, Sparkles } from "lucide-react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { useAuthStore } from "@/lib/store/authStore";
import { useCartStore } from "@/lib/store/cartStore";
import { useToast } from "@/components/providers/ToastProvider";
import {
  createSkinAnalysis,
  listSkinAnalyses,
  updateSkinAnalysisNotes,
} from "@/lib/firebase/skinAnalysis";
import { isOutOfStock } from "@/lib/productAvailability";
import type { Product } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import { calculateSkinScore, compareSkinScores } from "@/lib/skin-analysis/score";
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

type LocalSkinAnalysisStore = {
  latest?: SkinAnalysisRecord;
  history?: SkinAnalysisRecord[];
};

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

function readLocalHistory() {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return { history: [] as SkinAnalysisRecord[] };

  try {
    const parsed = JSON.parse(stored) as SkinAnalysisRecord | LocalSkinAnalysisStore;
    if ("answers" in parsed && "result" in parsed) {
      return { latest: parsed, history: [parsed] };
    }
    return {
      latest: parsed.latest,
      history: parsed.history ?? (parsed.latest ? [parsed.latest] : []),
    };
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return { history: [] as SkinAnalysisRecord[] };
  }
}

function writeLocalHistory(record: SkinAnalysisRecord) {
  const current = readLocalHistory();
  const history = [
    record,
    ...(current.history ?? []).filter(
      (item) => item.completedAt !== record.completedAt && item.id !== record.id,
    ),
  ].slice(0, 12);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ latest: record, history }));
  return history;
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
  const [history, setHistory] = useState<SkinAnalysisRecord[]>([]);
  const [notes, setNotes] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);

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
  const previousForComparison = useMemo(
    () =>
      record
        ? history.find((item) => item.completedAt !== record.completedAt && item.skinScore)
        : null,
    [history, record],
  );
  const comparison = useMemo(() => {
    if (!record?.skinScore || !previousForComparison?.skinScore) return [];
    return compareSkinScores(
      previousForComparison.skinScore.breakdown,
      record.skinScore.breakdown,
    );
  }, [previousForComparison, record]);
  const daysSincePrevious = previousRecord
    ? Math.floor(
        (Date.now() - new Date(previousRecord.completedAt).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : 0;

  useEffect(() => {
    const local = readLocalHistory();
    setHistory(local.history ?? []);
    if (local.latest) setPreviousRecord(local.latest);
  }, []);

  useEffect(() => {
    if (!user?.uid) return;

    let active = true;
    void listSkinAnalyses(user.uid).then((items) => {
      if (!active) return;
      setHistory(items);
      if (items[0]) setPreviousRecord(items[0]);
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
        skinScore: calculateSkinScore(answers),
        notes: "",
        recommendationVersion: "rules-v1",
        completedAt: new Date().toISOString(),
      };

      setRecord(nextRecord);
      setPreviousRecord(nextRecord);
      setNotes("");
      setHistory(writeLocalHistory(nextRecord));

      if (user?.uid) {
        void createSkinAnalysis(user.uid, nextRecord)
          .then((savedRecord) => {
            setRecord(savedRecord);
            setPreviousRecord(savedRecord);
            setHistory((current) => [
              savedRecord,
              ...current.filter((item) => item.completedAt !== savedRecord.completedAt),
            ]);
            writeLocalHistory(savedRecord);
          })
          .catch(() => {
            showToast({
              message: "Analysis saved on this device. Sign in again to sync history.",
              variant: "info",
            });
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
    setNotes("");
    setStage("quiz");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function viewPrevious() {
    if (!previousRecord) return;
    setRecord(previousRecord);
    setAnswers(previousRecord.answers);
    setNotes(previousRecord.notes || "");
    setStage("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveNotes() {
    if (!record) return;
    const nextRecord = { ...record, notes: notes.trim() };
    setRecord(nextRecord);
    setPreviousRecord(nextRecord);
    setHistory((current) =>
      current.map((item) =>
        item.id === nextRecord.id || item.completedAt === nextRecord.completedAt
          ? nextRecord
          : item,
      ),
    );
    writeLocalHistory(nextRecord);

    if (!user?.uid || !nextRecord.id) {
      showToast({
        message: user?.uid
          ? "Notes saved locally."
          : "Notes saved on this device. Sign in for permanent history.",
        variant: "success",
      });
      return;
    }

    setNotesSaving(true);
    try {
      await updateSkinAnalysisNotes(user.uid, nextRecord.id, notes);
      showToast({ message: "Analysis notes saved.", variant: "success" });
    } catch {
      showToast({
        message: "Notes saved locally. Cloud sync will retry later.",
        variant: "info",
      });
    } finally {
      setNotesSaving(false);
    }
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
            <div className="mt-8 space-y-3">
              {daysSincePrevious > 30 && (
                <div className="rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-off-white)] p-4 text-sm">
                  <p className="font-semibold">It has been over a month since your last skin analysis.</p>
                  <p className="mt-1 text-[var(--brand-text-muted)]">
                    Retake your analysis to keep your routine aligned with your current skin.
                  </p>
                </div>
              )}
              <button
                type="button"
                onClick={viewPrevious}
                className="w-full rounded-full border border-black px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] transition hover:bg-black hover:text-white"
              >
                View Previous Analysis
              </button>
            </div>
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

              {record.skinScore && (
                <section className="mt-8 grid gap-4 md:grid-cols-[0.35fr_0.65fr]">
                  <div className="rounded-3xl border border-black bg-black p-6 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                      Overall Skin Score
                    </p>
                    <p className="mt-4 font-display text-6xl font-semibold leading-none">
                      {record.skinScore.overall}
                    </p>
                    <p className="mt-2 text-sm text-white/65">out of 100</p>
                  </div>
                  <div className="grid gap-3 rounded-3xl border border-[var(--brand-border)] bg-[var(--brand-off-white)] p-5 sm:grid-cols-2">
                    {Object.entries(record.skinScore.breakdown).map(([key, value]) => (
                      <div key={key} className="rounded-2xl bg-white p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-text-muted)]">
                          {key === "barrierHealth"
                            ? "Barrier Health"
                            : key === "oilBalance"
                              ? "Oil Balance"
                              : key}
                        </p>
                        <p className="mt-2 font-semibold">{value}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <div className="mt-8 grid gap-5 lg:grid-cols-2">
                <RoutineList title="Morning Routine" steps={result.morningRoutine} />
                <RoutineList title="Night Routine" steps={result.nightRoutine} />
              </div>

              <section className="mt-8 rounded-3xl border border-[var(--brand-border)] bg-white p-5 md:p-6">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-text-muted)]">
                      Progress Notes
                    </p>
                    <h3 className="mt-2 font-display text-3xl font-semibold">
                      Add context to this analysis
                    </h3>
                  </div>
                  {!user?.uid && (
                    <Link href="/account" className="text-sm font-semibold underline">
                      Sign in for permanent history
                    </Link>
                  )}
                </div>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={4}
                  maxLength={500}
                  placeholder="Example: Started sunscreen this week. Breakouts reduced. Skin feels less oily."
                  className="mt-5 w-full rounded-2xl border border-[var(--brand-border)] px-4 py-3 text-sm outline-none focus:border-black"
                />
                <button
                  type="button"
                  onClick={() => void saveNotes()}
                  disabled={notesSaving}
                  className="mt-4 rounded-full bg-black px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-50"
                >
                  {notesSaving ? "Saving..." : "Save Notes"}
                </button>
              </section>

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

              {comparison.length > 0 && (
                <section className="mt-8 rounded-3xl border border-[var(--brand-border)] bg-white p-5 md:p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-text-muted)]">
                    Compare Analyses
                  </p>
                  <h3 className="mt-2 font-display text-3xl font-semibold">
                    Latest vs Previous
                  </h3>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {comparison.map((item) => (
                      <div key={item.field} className="rounded-2xl border border-[var(--brand-border)] p-4">
                        <p className="text-sm font-semibold">{item.label}</p>
                        <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                          <span className="text-[var(--brand-text-muted)]">{item.previous}</span>
                          <ArrowRight className="h-4 w-4 text-[var(--brand-mid-gray)]" />
                          <span className="font-semibold">{item.current}</span>
                        </div>
                        <p
                          className={`mt-3 text-xs font-semibold uppercase tracking-[0.14em] ${
                            item.trend === "Improved"
                              ? "text-[var(--brand-green-check)]"
                              : item.trend === "Needs Attention"
                                ? "text-amber-700"
                                : "text-[var(--brand-text-muted)]"
                          }`}
                        >
                          {item.trend}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {history.length > 0 && (
                <section className="mt-8 rounded-3xl border border-[var(--brand-border)] bg-white p-5 md:p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-text-muted)]">
                    Skin History
                  </p>
                  <h3 className="mt-2 font-display text-3xl font-semibold">
                    Previous Analyses
                  </h3>
                  <div className="mt-5 space-y-4">
                    {history.map((item) => (
                      <article
                        key={item.id || item.completedAt}
                        className="rounded-2xl border border-[var(--brand-border)] p-4"
                      >
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                          <div>
                            <p className="text-sm font-semibold">
                              {new Date(item.completedAt).toLocaleDateString("en-IN")}
                            </p>
                            <p className="mt-1 font-display text-2xl font-semibold">
                              {item.result.profileTitle}
                            </p>
                            <p className="mt-2 text-sm text-[var(--brand-text-muted)]">
                              {item.result.primaryConcerns.join(", ")}
                            </p>
                          </div>
                          <div className="rounded-full bg-[var(--brand-off-white)] px-4 py-2 text-sm font-semibold">
                            {item.skinScore?.overall ?? "--"} / 100
                          </div>
                        </div>
                        <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                          <div>
                            <p className="font-semibold">Morning</p>
                            <p className="mt-1 text-[var(--brand-text-muted)]">
                              {item.result.morningRoutine.map((step) => step.label).join(" / ")}
                            </p>
                          </div>
                          <div>
                            <p className="font-semibold">Night</p>
                            <p className="mt-1 text-[var(--brand-text-muted)]">
                              {item.result.nightRoutine.map((step) => step.label).join(" / ")}
                            </p>
                          </div>
                        </div>
                        {item.notes && (
                          <p className="mt-4 rounded-xl bg-[var(--brand-off-white)] p-3 text-sm text-[var(--brand-text-muted)]">
                            {item.notes}
                          </p>
                        )}
                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setRecord(item);
                              setAnswers(item.answers);
                              setNotes(item.notes || "");
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="rounded-full border border-black px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em]"
                          >
                            View Details
                          </button>
                          <button
                            type="button"
                            onClick={retake}
                            className="rounded-full bg-black px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white"
                          >
                            Retake Analysis
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}

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
