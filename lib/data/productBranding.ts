const renamedProducts: Record<string, { current: string; previous: string[] }> = {
  "1": {
    current: "CLINVARA Acne Reset Serum (Powered by Acnesium)",
    previous: ["Niacinamide 10% Face Serum"],
  },
  "nmf-ha-cleanser": {
    current: "CLINVARA Clear Cleanse (Anti-Acne Face Wash)",
    previous: ["Natural Moisturizing Factors + HA Cleanser", "NMF + HA Cleanser"],
  },
  "2": {
    current: "CLINVARA Clear Cleanse (Anti-Acne Face Wash)",
    previous: ["Natural Moisturizing Factors + HA Cleanser", "NMF + HA Cleanser"],
  },
  "niacinamide-10-zinc-serum": {
    current: "CLINVARA Acne Reset Serum (Powered by Acnesium)",
    previous: ["Niacinamide 10% Face Serum"],
  },
  "3": {
    current: "Deep Pigmentation Cream",
    previous: [],
  },
  "deep-pigmentation-cream": {
    current: "Deep Pigmentation Cream",
    previous: [],
  },
  "ceramide-moisture": {
    current: "CLINVARA Barrier Restore Gel (Ceramide Moisturizer)",
    previous: ["Ceramide Moisture"],
  },
  "4": {
    current: "CLINVARA Barrier Restore Gel (Ceramide Moisturizer)",
    previous: ["Ceramide Moisture"],
  },
  "5": {
    current: "CLINVARA Shield SPF 50+ (Sunscreen)",
    previous: [],
  },
  "shield-spf-50-sunscreen": {
    current: "CLINVARA Shield SPF 50+ (Sunscreen)",
    previous: [],
  },
};

function removeTrademarkSymbols(value: string) {
  return value.replace(
    /(?:\u2122|\u00e2\u201e\u00a2|\u00c3\u00a2\u20ac\u017e\u00c2\u00a2|\(TM\))/g,
    "",
  );
}

export function canonicalProductName(slugOrId: string | undefined, name: string | undefined) {
  const entry = slugOrId ? renamedProducts[slugOrId] : undefined;
  const cleanName = removeTrademarkSymbols(name || "");
  if (!entry) return cleanName;
  if (!cleanName || entry.previous.includes(cleanName) || cleanName === entry.current) {
    return entry.current;
  }
  return cleanName;
}
