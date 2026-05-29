"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { AdminTable } from "@/components/admin/AdminTable";
import { Header } from "@/components/admin/ProductsAdmin";
import { createCouponDraft, deleteCoupon, listCoupons, saveCoupon } from "@/lib/admin/firestore";
import type { AdminCoupon } from "@/lib/admin/types";

export function CouponsAdmin() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    setCoupons(await listCoupons().catch(() => []));
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function patch(coupon: AdminCoupon, data: Partial<AdminCoupon>) {
    const next = { ...coupon, ...data };
    setCoupons((current) => current.map((item) => (item.id === coupon.id ? next : item)));
    await saveCoupon(next);
  }

  return (
    <div className="space-y-6">
      <Header
        title="Coupons"
        description="Create and manage promotion rules."
        actionLabel="Create coupon"
        onAction={async () => {
          const draft = await createCouponDraft();
          setCoupons((current) => [draft, ...current]);
        }}
      />
      {loading ? (
        <div className="skeleton h-64 rounded-lg" />
      ) : (
        <AdminTable columns={["Code", "Type", "Value", "Minimum", "Expiry", "Limit", "Active", ""]} empty={!coupons.length}>
          {coupons.map((coupon) => (
            <tr key={coupon.id}>
              <td className="px-4 py-4">
                <input value={coupon.code} onChange={(event) => void patch(coupon, { code: event.target.value })} className="w-32 rounded-md border border-[var(--brand-border)] px-3 py-2" />
              </td>
              <td className="px-4 py-4">
                <select value={coupon.discountType} onChange={(event) => void patch(coupon, { discountType: event.target.value as AdminCoupon["discountType"] })} className="rounded-md border border-[var(--brand-border)] px-3 py-2">
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed</option>
                </select>
              </td>
              <td className="px-4 py-4">
                <NumberInput value={coupon.discountValue} onChange={(value) => void patch(coupon, { discountValue: value })} />
              </td>
              <td className="px-4 py-4">
                <NumberInput value={coupon.minimumOrderValue} onChange={(value) => void patch(coupon, { minimumOrderValue: value })} />
              </td>
              <td className="px-4 py-4">
                <input type="date" value={coupon.expiryDate} onChange={(event) => void patch(coupon, { expiryDate: event.target.value })} className="rounded-md border border-[var(--brand-border)] px-3 py-2" />
              </td>
              <td className="px-4 py-4">
                <NumberInput value={coupon.usageLimit} onChange={(value) => void patch(coupon, { usageLimit: value })} />
              </td>
              <td className="px-4 py-4">
                <input type="checkbox" checked={coupon.active} onChange={(event) => void patch(coupon, { active: event.target.checked })} />
              </td>
              <td className="px-4 py-4">
                <button type="button" aria-label="Delete coupon" onClick={async () => { await deleteCoupon(coupon.id); await refresh(); }} className="rounded-full border border-[var(--brand-border)] p-2">
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}
    </div>
  );
}

function NumberInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <input
      type="number"
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="w-24 rounded-md border border-[var(--brand-border)] px-3 py-2"
    />
  );
}
