import { collection, getDocs, query, where } from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase/client";
import type { AdminCoupon } from "@/lib/admin/types";

export async function validateCoupon(code: string, subtotal: number) {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { valid: false, reason: "Enter a coupon code." };

  const snapshot = await getDocs(
    query(collection(firebaseDb, "coupons"), where("code", "==", normalized)),
  );
  const coupon = snapshot.docs[0]?.data() as AdminCoupon | undefined;

  if (!coupon || !coupon.active) {
    return { valid: false, reason: "Coupon is not active." };
  }

  if (coupon.expiryDate && new Date(coupon.expiryDate).getTime() < Date.now()) {
    return { valid: false, reason: "Coupon has expired." };
  }

  if (subtotal < Number(coupon.minimumOrderValue || 0)) {
    return {
      valid: false,
      reason: `Minimum order value is Rs.${coupon.minimumOrderValue}.`,
    };
  }

  const discount =
    coupon.discountType === "percentage"
      ? Math.round((subtotal * Number(coupon.discountValue || 0)) / 100)
      : Number(coupon.discountValue || 0);

  return {
    valid: true,
    coupon,
    discount: Math.min(discount, subtotal),
  };
}
