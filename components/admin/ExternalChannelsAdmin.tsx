"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeIndianRupee,
  Boxes,
  CircleDashed,
  PackageOpen,
  RotateCcw,
  ShieldCheck,
  Store,
  Truck,
} from "lucide-react";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { Header } from "@/components/admin/ProductsAdmin";
import {
  externalChannelCollections,
  listExternalChannels,
} from "@/lib/admin/externalChannels";
import type { ExternalChannel, ExternalChannelStatus, SettlementStatus } from "@/lib/admin/types";

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function statusLabel(value: string) {
  return value.replace(/_/g, " ");
}

function StatusPill({
  value,
}: {
  value: ExternalChannelStatus | SettlementStatus | string;
}) {
  const active = ["connected", "synced", "settled"].includes(value);
  const warning = ["awaiting_onboarding", "pending", "action_required"].includes(value);

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : warning
            ? "bg-amber-50 text-amber-700"
            : "bg-zinc-100 text-zinc-600"
      }`}
    >
      {statusLabel(value)}
    </span>
  );
}

function ChannelMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-zinc-950">{value}</p>
    </div>
  );
}

export function ExternalChannelsAdmin() {
  const [channels, setChannels] = useState<ExternalChannel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    listExternalChannels()
      .then((items) => {
        if (active) setChannels(items);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const summary = useMemo(() => {
    return channels.reduce(
      (acc, channel) => {
        acc.products += channel.products || 0;
        acc.orders += channel.orders || 0;
        acc.revenue += channel.revenue || 0;
        if (channel.connectionStatus === "connected") acc.connected += 1;
        return acc;
      },
      { connected: 0, products: 0, orders: 0, revenue: 0 },
    );
  }, [channels]);

  return (
    <div className="space-y-6">
      <Header
        title="External Channels"
        description="Prepare marketplace operations for Amazon, Flipkart, quick commerce, and grocery channels."
      />

      <section className="grid gap-4 md:grid-cols-4">
        <AdminStatCard label="Connected Channels" value={`${summary.connected}/${channels.length || 8}`} icon={ShieldCheck} />
        <AdminStatCard label="Channel Products" value={summary.products} icon={PackageOpen} />
        <AdminStatCard label="Channel Orders" value={summary.orders} icon={Truck} />
        <AdminStatCard label="Channel Revenue" value={money(summary.revenue)} icon={BadgeIndianRupee} />
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <h2 className="text-lg font-semibold">Marketplace Readiness</h2>
            <p className="mt-1 text-sm text-zinc-500">
              No seller APIs are connected yet. These records are ready for future onboarding and sync jobs.
            </p>
          </div>
          <StatusPill value="not_connected" />
        </div>
        <div className="mt-5 grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-3">
          {Object.entries(externalChannelCollections).map(([key, value]) => (
            <div key={key} className="rounded-xl bg-zinc-50 px-4 py-3">
              <p className="font-medium capitalize text-zinc-950">{key}</p>
              <p className="mt-1 font-mono text-xs text-zinc-500">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="skeleton h-80 rounded-2xl" />
          ))}
        </div>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {channels.map((channel) => (
            <article
              key={channel.id}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-zinc-950 text-white">
                  <Store className="h-5 w-5" />
                </div>
                <StatusPill value={channel.connectionStatus} />
              </div>

              <h2 className="mt-5 text-xl font-semibold">{channel.name}</h2>
              <p className="mt-1 text-sm text-zinc-500">Awaiting Seller Onboarding</p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <ChannelMetric label="Products" value={channel.products || "No Data"} />
                <ChannelMetric label="Orders" value={channel.orders || "No Data"} />
                <ChannelMetric label="Revenue" value={channel.revenue ? money(channel.revenue) : "No Data"} />
                <ChannelMetric label="Inventory" value={channel.inventory || "No Data"} />
                <ChannelMetric label="Returns" value={channel.returns || "No Data"} />
                <ChannelMetric label="Settlement" value={statusLabel(channel.settlementStatus)} />
              </div>

              <div className="mt-5 space-y-2 rounded-xl bg-zinc-50 p-4 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-zinc-500">API Status</span>
                  <StatusPill value={channel.apiStatus} />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-zinc-500">Inventory Sync</span>
                  <StatusPill value={channel.inventorySyncStatus} />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-zinc-500">Order Sync</span>
                  <StatusPill value={channel.orderSyncStatus} />
                </div>
                <div className="flex items-center justify-between gap-3 pt-1 text-zinc-500">
                  <span className="inline-flex items-center gap-1">
                    <CircleDashed className="h-3.5 w-3.5" />
                    Last Sync
                  </span>
                  <span>{channel.lastSync || "Not Started"}</span>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <Boxes className="h-5 w-5" />
          <h3 className="mt-4 font-semibold">Inventory Sync Ready</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Channel inventory records can map CLINVARA SKUs to marketplace listings when seller APIs are added.
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <Truck className="h-5 w-5" />
          <h3 className="mt-4 font-semibold">Order Sync Ready</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Channel order records are structured for external order IDs, statuses, and revenue reconciliation.
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <RotateCcw className="h-5 w-5" />
          <h3 className="mt-4 font-semibold">Returns & Settlements Ready</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Future return and settlement records can be tracked separately from storefront returns.
          </p>
        </div>
      </section>
    </div>
  );
}
