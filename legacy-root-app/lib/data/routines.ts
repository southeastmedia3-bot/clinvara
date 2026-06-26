import type { Routine } from "@/lib/types";

export const routines: Routine[] = [
  {
    id: "am-oily",
    title: "AM Routine for Oily Skin",
    description: "Cleanse, treat, and hydrate without heaviness.",
    steps: [
      { label: "CLINVARA Clear Cleanse", slug: "nmf-ha-cleanser" },
      { label: "CLINVARA Acne Reset Serum (Powered by Acnesium)", slug: "niacinamide-10-zinc-serum" },
      { label: "CLINVARA Barrier Restore Gel (Ceramide Moisturizer)", slug: "ceramide-moisture" },
    ],
  },
  {
    id: "pm-dry",
    title: "PM Routine for Dry Skin",
    description: "Hydrate deeply overnight and support barrier recovery.",
    steps: [
      { label: "CLINVARA Clear Cleanse", slug: "nmf-ha-cleanser" },
      { label: "CLINVARA Barrier Restore Gel (Ceramide Moisturizer)", slug: "ceramide-moisture" },
    ],
  },
  {
    id: "starter",
    title: "Beginner's Starter Routine",
    description: "Simple, effective steps to build a consistent habit.",
    steps: [
      { label: "CLINVARA Clear Cleanse", slug: "nmf-ha-cleanser" },
      { label: "CLINVARA Barrier Restore Gel (Ceramide Moisturizer)", slug: "ceramide-moisture" },
    ],
  },
  {
    id: "brightening",
    title: "Brightening Routine",
    description: "Target dark spots and uneven tone.",
    steps: [
      { label: "CLINVARA Clear Cleanse", slug: "nmf-ha-cleanser" },
      { label: "CLINVARA Acne Reset Serum (Powered by Acnesium)", slug: "niacinamide-10-zinc-serum" },
      { label: "Deep Pigmentation Cream", slug: "deep-pigmentation-cream" },
    ],
  },
  {
    id: "barrier",
    title: "Barrier Repair Routine",
    description: "Strengthen skin when it feels sensitive or depleted.",
    steps: [
      { label: "CLINVARA Clear Cleanse", slug: "nmf-ha-cleanser" },
      { label: "CLINVARA Barrier Restore Gel (Ceramide Moisturizer)", slug: "ceramide-moisture" },
    ],
  },
  {
    id: "pigmentation",
    title: "Pigmentation-Focused Routine",
    description: "Even tone with targeted actives and hydration.",
    steps: [
      { label: "CLINVARA Clear Cleanse", slug: "nmf-ha-cleanser" },
      { label: "Deep Pigmentation Cream", slug: "deep-pigmentation-cream" },
      { label: "CLINVARA Acne Reset Serum (Powered by Acnesium)", slug: "niacinamide-10-zinc-serum" },
    ],
  },
];
