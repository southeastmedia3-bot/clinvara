"use client";

import { useMemo, useState } from "react";
import { BarChart3, ReceiptText, RotateCcw, ShieldAlert, Star, Trash2 } from "lucide-react";
import { Header } from "@/components/admin/ProductsAdmin";
import { useToast } from "@/components/providers/ToastProvider";
import {
  resetCollectionForMaintenance,
  resetOrdersForMaintenance,
} from "@/lib/admin/firestore";

const CONFIRMATION_TEXT = "CONFIRM RESET";

type MaintenanceTool = {
  id: "orders" | "returns" | "reviews" | "analytics";
  title: string;
  description: string;
  collection?: string;
  icon: typeof ReceiptText;
};

const tools: MaintenanceTool[] = [
  {
    id: "orders",
    title: "Reset Orders",
    description: "Deletes root orders and customer order mirrors. Use only for test data cleanup.",
    icon: ReceiptText,
  },
  {
    id: "returns",
    title: "Reset Returns",
    description: "Deletes all return requests from the returns collection.",
    collection: "returns",
    icon: RotateCcw,
  },
  {
    id: "reviews",
    title: "Reset Reviews",
    description: "Deletes all review documents from the reviews collection.",
    collection: "reviews",
    icon: Star,
  },
  {
    id: "analytics",
    title: "Reset Analytics Cache",
    description: "Deletes cached analytics documents without touching source orders or products.",
    collection: "analyticsCache",
    icon: BarChart3,
  },
];

export function MaintenanceAdmin() {
  const { showToast } = useToast();
  const [selectedId, setSelectedId] = useState<MaintenanceTool["id"]>("orders");
  const [confirmation, setConfirmation] = useState("");
  const [workingId, setWorkingId] = useState<MaintenanceTool["id"] | null>(null);
  const [result, setResult] = useState<string>("");

  const selectedTool = useMemo(
    () => tools.find((tool) => tool.id === selectedId) || tools[0],
    [selectedId],
  );
  const confirmed = confirmation === CONFIRMATION_TEXT;
  const working = workingId === selectedTool.id;

  async function runReset() {
    if (!confirmed || workingId) return;

    setWorkingId(selectedTool.id);
    setResult("");

    try {
      if (selectedTool.id === "orders") {
        const summary = await resetOrdersForMaintenance();
        const message = `Deleted ${summary.rootOrders} root orders and ${summary.customerOrderMirrors} customer mirrors.`;
        setResult(message);
        showToast({ message, variant: "success" });
      } else if (selectedTool.collection) {
        const deleted = await resetCollectionForMaintenance(selectedTool.collection);
        const message = `Deleted ${deleted} ${selectedTool.collection} document${
          deleted === 1 ? "" : "s"
        }.`;
        setResult(message);
        showToast({ message, variant: "success" });
      }
      setConfirmation("");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to complete reset. Check permissions.";
      setResult(message);
      showToast({ message, variant: "error" });
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <Header
        title="Maintenance"
        description="Admin-only cleanup tools for operational data. Each reset requires explicit confirmation."
      />

      <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
        <div className="flex gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold">Restricted maintenance area</p>
            <p className="mt-1 leading-6">
              These actions delete Firestore documents and cannot be undone. There is no
              one-click reset-all action.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const active = selectedTool.id === tool.id;
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => {
                setSelectedId(tool.id);
                setConfirmation("");
                setResult("");
              }}
              className={`rounded-xl border p-5 text-left transition ${
                active
                  ? "border-zinc-950 bg-white shadow-sm"
                  : "border-zinc-200 bg-white hover:border-zinc-400"
              }`}
            >
              <span className="inline-flex rounded-full bg-zinc-100 p-3 text-zinc-700">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="mt-4 block text-sm font-semibold text-zinc-950">
                {tool.title}
              </span>
              <span className="mt-2 block text-sm leading-6 text-zinc-500">
                {tool.description}
              </span>
            </button>
          );
        })}
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Selected Action
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              {selectedTool.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">{selectedTool.description}</p>
          </div>

          <div className="w-full lg:max-w-md">
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Type {CONFIRMATION_TEXT}
            </label>
            <input
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder={CONFIRMATION_TEXT}
              className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-950"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-zinc-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-500">
            {result || "Reset actions are disabled until the confirmation text matches exactly."}
          </p>
          <button
            type="button"
            onClick={runReset}
            disabled={!confirmed || Boolean(workingId)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white transition disabled:cursor-not-allowed disabled:bg-zinc-300"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            {working ? "Resetting..." : "Run Reset"}
          </button>
        </div>
      </section>
    </div>
  );
}
