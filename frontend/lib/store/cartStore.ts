import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem } from "@/lib/types";

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
};

function keyOf(productId: string, size: string) {
  return `${productId}::${size}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
      addItem: (item) => {
        const qty = item.quantity ?? 1;
        const items = get().items;
        const idx = items.findIndex(
          (i) => keyOf(i.productId, i.size) === keyOf(item.productId, item.size),
        );
        if (idx >= 0) {
          const next = [...items];
          const nextQty = Math.min(10, next[idx].quantity + qty);
          next[idx] = { ...next[idx], quantity: nextQty };
          set({ items: next, isOpen: true });
        } else {
          set({
            items: [...items, { ...item, quantity: Math.min(10, qty) }],
            isOpen: true,
          });
        }
      },
      removeItem: (productId, size) =>
        set({
          items: get().items.filter(
            (i) => keyOf(i.productId, i.size) !== keyOf(productId, size),
          ),
        }),
      updateQuantity: (productId, size, quantity) => {
        const q = Math.max(1, Math.min(10, quantity));
        set({
          items: get().items.map((i) =>
            keyOf(i.productId, i.size) === keyOf(productId, size)
              ? { ...i, quantity: q }
              : i,
          ),
        });
      },
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "clinvara-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items }),
    },
  ),
);

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function cartCount(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}
