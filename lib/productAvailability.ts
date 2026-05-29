import type { Product } from "@/lib/types";

export function isOutOfStock(product: Product) {
  return product.availability === "out_of_stock" || Number(product.stock ?? 1) <= 0;
}

export function isLowStock(product: Product) {
  if (isOutOfStock(product)) return false;
  return Number(product.stock ?? 999) <= Number(product.lowStockThreshold ?? 5);
}
