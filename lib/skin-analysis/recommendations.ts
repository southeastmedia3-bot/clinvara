export type SkinType = "oily" | "dry" | "combination" | "normal" | "sensitive";

export type SkinConcern =
  | "acne"
  | "pigmentation"
  | "dark-spots"
  | "uneven-tone"
  | "dryness"
  | "oiliness"
  | "redness"
  | "fine-lines"
  | "barrier-damage"
  | "dull-skin";

export type BreakoutFrequency = "never" | "occasionally" | "frequently" | "severe";
export type SensitivityLevel = "low" | "medium" | "high";
export type AgeGroup = "18-24" | "25-34" | "35-44" | "45+";
export type OutdoorExposure = "less-than-1-hour" | "1-3-hours" | "more-than-3-hours";
export type RoutineLevel = "none" | "basic" | "intermediate" | "advanced";
export type BudgetRange = "500-1000" | "1000-2000" | "2000+" | "no-preference";
export type SkinGoal =
  | "clear-acne"
  | "repair-barrier"
  | "hydration"
  | "reduce-pigmentation"
  | "sun-protection"
  | "glowing-skin"
  | "even-tone"
  | "anti-ageing";

export type SkinAnalysisAnswers = {
  skinType: SkinType | "";
  concerns: SkinConcern[];
  breakouts: BreakoutFrequency | "";
  sensitivity: SensitivityLevel | "";
  ageGroup: AgeGroup | "";
  outdoorExposure: OutdoorExposure | "";
  routineLevel: RoutineLevel | "";
  budget: BudgetRange | "";
  goal: SkinGoal | "";
};

export type SkinAnalysisQuestion =
  | {
      id: keyof SkinAnalysisAnswers;
      title: string;
      helper?: string;
      type: "single";
      options: { label: string; value: string }[];
    }
  | {
      id: "concerns";
      title: string;
      helper?: string;
      type: "multi";
      options: { label: string; value: SkinConcern }[];
    };

export type RoutineStep = {
  label: string;
  slug: string;
  note: string;
};

export type SkinAnalysisResult = {
  profileTitle: string;
  primaryConcerns: string[];
  morningRoutine: RoutineStep[];
  nightRoutine: RoutineStep[];
  recommendedProductSlugs: string[];
  tips: string[];
};

export type SkinAnalysisRecord = {
  id?: string;
  answers: SkinAnalysisAnswers;
  result: SkinAnalysisResult;
  completedAt: string;
  notes?: string;
  skinScore?: SkinScoreResult;
  recommendationVersion?: string;
};

export const emptySkinAnalysisAnswers: SkinAnalysisAnswers = {
  skinType: "",
  concerns: [],
  breakouts: "",
  sensitivity: "",
  ageGroup: "",
  outdoorExposure: "",
  routineLevel: "",
  budget: "",
  goal: "",
};

export const skinAnalysisQuestions: SkinAnalysisQuestion[] = [
  {
    id: "skinType",
    type: "single",
    title: "What best describes your skin?",
    options: [
      { label: "Oily", value: "oily" },
      { label: "Dry", value: "dry" },
      { label: "Combination", value: "combination" },
      { label: "Normal", value: "normal" },
      { label: "Sensitive", value: "sensitive" },
    ],
  },
  {
    id: "concerns",
    type: "multi",
    title: "Select your main concerns",
    helper: "Choose all that apply.",
    options: [
      { label: "Acne", value: "acne" },
      { label: "Pigmentation", value: "pigmentation" },
      { label: "Dark Spots", value: "dark-spots" },
      { label: "Uneven Tone", value: "uneven-tone" },
      { label: "Dryness", value: "dryness" },
      { label: "Oiliness", value: "oiliness" },
      { label: "Redness", value: "redness" },
      { label: "Fine Lines", value: "fine-lines" },
      { label: "Barrier Damage", value: "barrier-damage" },
      { label: "Dull Skin", value: "dull-skin" },
    ],
  },
  {
    id: "breakouts",
    type: "single",
    title: "How often do you experience breakouts?",
    options: [
      { label: "Never", value: "never" },
      { label: "Occasionally", value: "occasionally" },
      { label: "Frequently", value: "frequently" },
      { label: "Severe", value: "severe" },
    ],
  },
  {
    id: "sensitivity",
    type: "single",
    title: "How sensitive is your skin?",
    options: [
      { label: "Low", value: "low" },
      { label: "Medium", value: "medium" },
      { label: "High", value: "high" },
    ],
  },
  {
    id: "ageGroup",
    type: "single",
    title: "Age Group",
    options: [
      { label: "18-24", value: "18-24" },
      { label: "25-34", value: "25-34" },
      { label: "35-44", value: "35-44" },
      { label: "45+", value: "45+" },
    ],
  },
  {
    id: "outdoorExposure",
    type: "single",
    title: "How much time do you spend outdoors daily?",
    options: [
      { label: "Less than 1 hour", value: "less-than-1-hour" },
      { label: "1-3 hours", value: "1-3-hours" },
      { label: "More than 3 hours", value: "more-than-3-hours" },
    ],
  },
  {
    id: "routineLevel",
    type: "single",
    title: "Current skincare routine",
    options: [
      { label: "None", value: "none" },
      { label: "Basic", value: "basic" },
      { label: "Intermediate", value: "intermediate" },
      { label: "Advanced", value: "advanced" },
    ],
  },
  {
    id: "budget",
    type: "single",
    title: "Budget",
    options: [
      { label: "INR 500-1000", value: "500-1000" },
      { label: "INR 1000-2000", value: "1000-2000" },
      { label: "INR 2000+", value: "2000+" },
      { label: "No Preference", value: "no-preference" },
    ],
  },
  {
    id: "goal",
    type: "single",
    title: "Biggest Goal",
    options: [
      { label: "Clear Acne", value: "clear-acne" },
      { label: "Repair Barrier", value: "repair-barrier" },
      { label: "Hydration", value: "hydration" },
      { label: "Reduce Pigmentation", value: "reduce-pigmentation" },
      { label: "Sun Protection", value: "sun-protection" },
      { label: "Glowing Skin", value: "glowing-skin" },
      { label: "Even Tone", value: "even-tone" },
      { label: "Anti-Ageing", value: "anti-ageing" },
    ],
  },
];

const labels: Record<string, string> = Object.fromEntries(
  skinAnalysisQuestions.flatMap((question) =>
    question.options.map((option) => [option.value, option.label]),
  ),
);

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function hasConcern(answers: SkinAnalysisAnswers, concern: SkinConcern) {
  return answers.concerns.includes(concern);
}

function addStep(steps: RoutineStep[], step: RoutineStep) {
  if (!steps.some((item) => item.slug === step.slug)) {
    steps.push(step);
  }
}

function productSlugsFromRoutine(...routines: RoutineStep[][]) {
  return unique(routines.flatMap((routine) => routine.map((step) => step.slug)));
}

export function optionLabel(value: string) {
  return labels[value] || value;
}

export function isStepAnswered(answers: SkinAnalysisAnswers, question: SkinAnalysisQuestion) {
  const value = answers[question.id];
  return Array.isArray(value) ? value.length > 0 : Boolean(value);
}

export function buildSkinAnalysisResult(answers: SkinAnalysisAnswers): SkinAnalysisResult {
  const morning: RoutineStep[] = [];
  const night: RoutineStep[] = [];
  const tips: string[] = [];

  addStep(morning, {
    label: "CLINVARA Clear Cleanse",
    slug: "clear-cleanse-face-wash",
    note: "Start with a gentle cleanse that does not leave skin feeling stripped.",
  });
  addStep(night, {
    label: "CLINVARA Clear Cleanse",
    slug: "clear-cleanse-face-wash",
    note: "Cleanse thoroughly in the evening, especially after sunscreen or outdoor exposure.",
  });

  if (
    hasConcern(answers, "acne") ||
    hasConcern(answers, "oiliness") ||
    hasConcern(answers, "uneven-tone") ||
    answers.breakouts === "frequently" ||
    answers.breakouts === "severe" ||
    answers.goal === "clear-acne" ||
    answers.goal === "even-tone"
  ) {
    addStep(morning, {
      label: "CLINVARA Acne Reset Serum",
      slug: "acne-reset-serum",
      note: "Use a lightweight niacinamide serum for oil balance and more even-looking skin.",
    });
    addStep(night, {
      label: "CLINVARA Acne Reset Serum",
      slug: "acne-reset-serum",
      note: "Keep actives consistent, but reduce frequency if skin feels reactive.",
    });
    tips.push("Introduce active serums gradually. Consistency matters more than layering too many actives.");
  }

  if (
    hasConcern(answers, "pigmentation") ||
    hasConcern(answers, "dark-spots") ||
    hasConcern(answers, "dull-skin") ||
    answers.goal === "reduce-pigmentation" ||
    answers.goal === "glowing-skin"
  ) {
    addStep(night, {
      label: "Deep Pigmentation Cream",
      slug: "deep-pigmentation-cream",
      note: "Use at night for targeted tone-care support, then follow with moisturizer.",
    });
    tips.push("For pigmentation routines, daily sunscreen is non-negotiable. UV exposure can undo progress.");
  }

  if (
    answers.skinType === "dry" ||
    answers.skinType === "sensitive" ||
    answers.sensitivity === "high" ||
    hasConcern(answers, "dryness") ||
    hasConcern(answers, "redness") ||
    hasConcern(answers, "barrier-damage") ||
    answers.goal === "repair-barrier" ||
    answers.goal === "hydration"
  ) {
    addStep(night, {
      label: "CLINVARA Barrier Restore Gel",
      slug: "barrier-restore-gel",
      note: "Seal the routine with ceramides and barrier-supporting hydration.",
    });
    addStep(morning, {
      label: "CLINVARA Barrier Restore Gel",
      slug: "barrier-restore-gel",
      note: "Apply a thin layer before sunscreen if skin feels dry or tight.",
    });
    tips.push("When skin feels sensitive, simplify: cleanse, moisturize, protect, then reintroduce actives slowly.");
  }

  if (
    answers.outdoorExposure !== "less-than-1-hour" ||
    answers.goal === "sun-protection" ||
    hasConcern(answers, "pigmentation") ||
    hasConcern(answers, "dark-spots")
  ) {
    addStep(morning, {
      label: "CLINVARA Shield SPF 50+",
      slug: "shield-spf-50-sunscreen",
      note: "Finish your morning routine with broad-spectrum SPF and reapply outdoors.",
    });
  }

  if (!morning.some((step) => step.slug === "shield-spf-50-sunscreen")) {
    addStep(morning, {
      label: "CLINVARA Shield SPF 50+",
      slug: "shield-spf-50-sunscreen",
      note: "Use sunscreen every morning as the final step.",
    });
  }

  if (!night.some((step) => step.slug === "barrier-restore-gel")) {
    addStep(night, {
      label: "CLINVARA Barrier Restore Gel",
      slug: "barrier-restore-gel",
      note: "End with barrier support to keep the routine comfortable.",
    });
  }

  if (answers.routineLevel === "none" || answers.routineLevel === "basic") {
    tips.push("Keep the first two weeks simple. Add one new product at a time and watch how your skin responds.");
  }

  if (answers.ageGroup === "35-44" || answers.ageGroup === "45+") {
    tips.push("Prioritize barrier support, daily sunscreen, and consistent hydration for long-term skin resilience.");
  }

  if (answers.budget === "500-1000") {
    tips.push("Start with cleanser plus one priority treatment. Add moisturizer or SPF next based on your main concern.");
  }

  const concerns = answers.concerns.map(optionLabel);
  const profileTitle = `${optionLabel(answers.skinType || "normal")} Skin`;

  return {
    profileTitle,
    primaryConcerns: concerns.length ? concerns : [optionLabel(answers.goal || "even-tone")],
    morningRoutine: morning,
    nightRoutine: night,
    recommendedProductSlugs: productSlugsFromRoutine(morning, night),
    tips: unique(tips).slice(0, 5),
  };
}
import type { SkinScoreResult } from "@/lib/skin-analysis/score";
