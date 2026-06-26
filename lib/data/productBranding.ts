const renamedProducts: Record<string, { current: string; previous: string[] }> = {
  "nmf-ha-cleanser": {
    current: "CLINVARA Clear Cleanse (Anti-Acne Face Wash)",
    previous: ["Natural Moisturizing Factors + HA Cleanser", "NMF + HA Cleanser"],
  },
  "niacinamide-10-zinc-serum": {
    current: "CLINVARA Acne Reset Serum (Powered by Acnesium™)",
    previous: ["Niacinamide 10% Face Serum"],
  },
  "ceramide-moisture": {
    current: "CLINVARA Barrier Restore Gel (Ceramide Moisturizer)",
    previous: ["Ceramide Moisture"],
  },
};

export function canonicalProductName(slugOrId: string | undefined, name: string | undefined) {
  const entry = slugOrId ? renamedProducts[slugOrId] : undefined;
  if (!entry) return name || "";
  if (!name || entry.previous.includes(name) || name === entry.current) return entry.current;
  return name;
}
