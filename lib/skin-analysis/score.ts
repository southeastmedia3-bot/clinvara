import type {
  SkinAnalysisAnswers,
  SkinConcern,
  SensitivityLevel,
} from "@/lib/skin-analysis/recommendations";

export type SkinScoreBreakdown = {
  acne: "Low" | "Medium" | "High";
  pigmentation: "Low" | "Medium" | "High";
  barrierHealth: "Poor" | "Fair" | "Good";
  sensitivity: "Low" | "Medium" | "High";
  hydration: "Low" | "Medium" | "Good";
  oilBalance: "Low" | "Medium" | "Good";
};

export type SkinScoreResult = {
  overall: number;
  breakdown: SkinScoreBreakdown;
};

const concernPenalty: Record<SkinConcern, number> = {
  acne: 9,
  pigmentation: 8,
  "dark-spots": 7,
  "uneven-tone": 6,
  dryness: 7,
  oiliness: 6,
  redness: 7,
  "fine-lines": 5,
  "barrier-damage": 10,
  "dull-skin": 5,
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function concernLevel(answers: SkinAnalysisAnswers, concerns: SkinConcern[]) {
  const count = concerns.filter((concern) => answers.concerns.includes(concern)).length;
  if (count >= 2) return "High";
  if (count === 1) return "Medium";
  return "Low";
}

function sensitivityLevel(value: SensitivityLevel | "") {
  if (value === "high") return "High";
  if (value === "medium") return "Medium";
  return "Low";
}

export function calculateSkinScore(answers: SkinAnalysisAnswers): SkinScoreResult {
  let score = 92;

  for (const concern of answers.concerns) {
    score -= concernPenalty[concern] ?? 4;
  }

  if (answers.breakouts === "occasionally") score -= 4;
  if (answers.breakouts === "frequently") score -= 10;
  if (answers.breakouts === "severe") score -= 16;

  if (answers.sensitivity === "medium") score -= 5;
  if (answers.sensitivity === "high") score -= 11;

  if (answers.skinType === "sensitive") score -= 5;
  if (answers.skinType === "dry") score -= 3;
  if (answers.routineLevel === "none") score -= 6;
  if (answers.routineLevel === "basic") score -= 3;
  if (answers.outdoorExposure === "more-than-3-hours") score -= 5;

  const barrierPoor =
    answers.concerns.includes("barrier-damage") ||
    answers.concerns.includes("redness") ||
    answers.sensitivity === "high";

  const hydrationLow =
    answers.concerns.includes("dryness") ||
    answers.skinType === "dry" ||
    answers.goal === "hydration";

  const oilHigh =
    answers.concerns.includes("oiliness") ||
    answers.skinType === "oily" ||
    answers.breakouts === "frequently" ||
    answers.breakouts === "severe";

  return {
    overall: clampScore(score),
    breakdown: {
      acne:
        answers.breakouts === "severe" || answers.breakouts === "frequently"
          ? "High"
          : concernLevel(answers, ["acne"]),
      pigmentation: concernLevel(answers, ["pigmentation", "dark-spots", "uneven-tone"]),
      barrierHealth: barrierPoor ? "Poor" : hydrationLow ? "Fair" : "Good",
      sensitivity: sensitivityLevel(answers.sensitivity),
      hydration: hydrationLow ? "Low" : answers.skinType === "normal" ? "Good" : "Medium",
      oilBalance: oilHigh ? "Low" : answers.skinType === "normal" ? "Good" : "Medium",
    },
  };
}

export function compareSkinScores(
  previous: SkinScoreBreakdown,
  current: SkinScoreBreakdown,
) {
  const fields: Array<keyof SkinScoreBreakdown> = [
    "acne",
    "pigmentation",
    "barrierHealth",
    "sensitivity",
    "hydration",
    "oilBalance",
  ];

  return fields.map((field) => ({
    field,
    label:
      field === "barrierHealth"
        ? "Barrier Health"
        : field === "oilBalance"
          ? "Oil Balance"
          : field.charAt(0).toUpperCase() + field.slice(1),
    previous: previous[field],
    current: current[field],
    trend: trendLabel(field, previous[field], current[field]),
  }));
}

function trendLabel(
  field: keyof SkinScoreBreakdown,
  previous: string,
  current: string,
) {
  const positiveOrder =
    field === "barrierHealth" || field === "hydration" || field === "oilBalance"
      ? ["Poor", "Low", "Fair", "Medium", "Good"]
      : ["High", "Medium", "Low"];

  const previousIndex = positiveOrder.indexOf(previous);
  const currentIndex = positiveOrder.indexOf(current);

  if (previousIndex === -1 || currentIndex === -1 || previousIndex === currentIndex) {
    return "Stable";
  }

  return currentIndex > previousIndex ? "Improved" : "Needs Attention";
}
