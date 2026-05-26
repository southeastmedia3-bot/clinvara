import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type WishlistState = {
  productIds: string[];
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
  count: () => number;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      toggle: (productId) => {
        const cur = get().productIds;
        if (cur.includes(productId)) {
          set({ productIds: cur.filter((id) => id !== productId) });
        } else {
          set({ productIds: [...cur, productId] });
        }
      },
      has: (productId) => get().productIds.includes(productId),
      count: () => get().productIds.length,
    }),
    {
      name: "clinvara-wishlist",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
