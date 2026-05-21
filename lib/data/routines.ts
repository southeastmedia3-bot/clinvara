import type { Routine } from "@/lib/types";

export const routines: Routine[] = [
  {
    id: "am-oily",
    title: "AM Routine for Oily Skin",
    description: "Cleanse, treat, and hydrate without heaviness.",
    steps: [
      { label: "NMF + HA Cleanser", slug: "nmf-ha-cleanser" },
      { label: "Niacinamide 10% Face Serum", slug: "niacinamide-10-zinc-serum" },
      { label: "Ceramide Moisture", slug: "ceramide-moisture" },
    ],
  },
  {
    id: "pm-dry",
    title: "PM Routine for Dry Skin",
    description: "Hydrate deeply overnight and support barrier recovery.",
    steps: [
      { label: "NMF + HA Cleanser", slug: "nmf-ha-cleanser" },
      { label: "Ceramide Moisture", slug: "ceramide-moisture" },
    ],
  },
  {
    id: "starter",
    title: "Beginner's Starter Routine",
    description: "Simple, effective steps to build a consistent habit.",
    steps: [
      { label: "NMF + HA Cleanser", slug: "nmf-ha-cleanser" },
      { label: "Ceramide Moisture", slug: "ceramide-moisture" },
    ],
  },
  {
    id: "brightening",
    title: "Brightening Routine",
    description: "Target dark spots and uneven tone.",
    steps: [
      { label: "NMF + HA Cleanser", slug: "nmf-ha-cleanser" },
      { label: "Niacinamide 10% Face Serum", slug: "niacinamide-10-zinc-serum" },
      { label: "Deep Pigmentation Cream", slug: "deep-pigmentation-cream" },
    ],
  },
  {
    id: "barrier",
    title: "Barrier Repair Routine",
    description: "Strengthen skin when it feels sensitive or depleted.",
    steps: [
      { label: "NMF + HA Cleanser", slug: "nmf-ha-cleanser" },
      { label: "Ceramide Moisture", slug: "ceramide-moisture" },
    ],
  },
  {
    id: "pigmentation",
    title: "Pigmentation-Focused Routine",
    description: "Even tone with targeted actives and hydration.",
    steps: [
      { label: "NMF + HA Cleanser", slug: "nmf-ha-cleanser" },
      { label: "Deep Pigmentation Cream", slug: "deep-pigmentation-cream" },
      { label: "Niacinamide 10% Face Serum", slug: "niacinamide-10-zinc-serum" },
    ],
  },
];
