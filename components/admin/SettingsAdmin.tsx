"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/admin/ProductsAdmin";
import { defaultSettings, readSettings, saveSettings } from "@/lib/admin/firestore";
import type { StoreSettings } from "@/lib/admin/types";

export function SettingsAdmin() {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const next = await readSettings().catch(() => defaultSettings);
      if (!active) return;
      setSettings(next);
      setLoading(false);
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  function update<K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveSettings(settings);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }

  if (loading) return <div className="skeleton h-96 rounded-lg" />;

  return (
    <div className="space-y-6">
      <Header title="Settings" description="Edit global store settings and public support details." />
      <form onSubmit={submit} className="space-y-5 rounded-lg border border-[var(--brand-border)] bg-white p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Store name" value={settings.storeName} onChange={(value) => update("storeName", value)} />
          <Field label="Support email" value={settings.supportEmail} onChange={(value) => update("supportEmail", value)} />
          <Field label="Support phone" value={settings.supportPhone} onChange={(value) => update("supportPhone", value)} />
          <Field label="Shipping charge" type="number" value={settings.shippingCharge} onChange={(value) => update("shippingCharge", Number(value))} />
          <Field label="Free shipping threshold" type="number" value={settings.freeShippingThreshold} onChange={(value) => update("freeShippingThreshold", Number(value))} />
          <Field label="Announcement bar text" value={settings.announcementBarText} onChange={(value) => update("announcementBarText", value)} />
          <Field label="Homepage banner text" value={settings.homepageBannerText} onChange={(value) => update("homepageBannerText", value)} />
          <Field label="Instagram" value={settings.socialLinks.instagram} onChange={(value) => update("socialLinks", { ...settings.socialLinks, instagram: value })} />
          <Field label="Facebook" value={settings.socialLinks.facebook} onChange={(value) => update("socialLinks", { ...settings.socialLinks, facebook: value })} />
          <Field label="YouTube" value={settings.socialLinks.youtube} onChange={(value) => update("socialLinks", { ...settings.socialLinks, youtube: value })} />
          <Field label="Threads" value={settings.socialLinks.threads} onChange={(value) => update("socialLinks", { ...settings.socialLinks, threads: value })} />
        </div>
        <button type="submit" className="rounded-full bg-black px-7 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white">
          Save settings
        </button>
        {saved && <p className="text-sm text-green-700">Settings saved.</p>}
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="space-y-2 text-sm">
      <span className="font-medium">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-[var(--brand-border)] px-3 py-3"
      />
    </label>
  );
}
