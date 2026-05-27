import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import type { CartItem } from "@/lib/types";
import { firebaseAuth, firebaseDb } from "@/lib/firebase/client";

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  firestoreReady: boolean;

  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;

  loadFromFirestore: () => Promise<void>;
  syncToFirestore: () => Promise<void>;

  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
};

function keyOf(productId: string, size: string) {
  return `${productId}::${size}`;
}

function safeCartId(productId: string, size: string) {
  return `${productId}_${size}`.replace(/[^a-zA-Z0-9_-]/g, "_");
}

async function saveCartItem(item: CartItem) {
  const user = firebaseAuth.currentUser;
  if (!user) return;

  const itemRef = doc(
    firebaseDb,
    "customers",
    user.uid,
    "cart",
    safeCartId(item.productId, item.size),
  );

  await setDoc(
    itemRef,
    {
      ...item,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

async function deleteCartItem(productId: string, size: string) {
  const user = firebaseAuth.currentUser;
  if (!user) return;

  await deleteDoc(
    doc(firebaseDb, "customers", user.uid, "cart", safeCartId(productId, size)),
  );
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      firestoreReady: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),

      addItem: (item) => {
        const qty = item.quantity ?? 1;
        const items = get().items;
        const idx = items.findIndex(
          (i) => keyOf(i.productId, i.size) === keyOf(item.productId, item.size),
        );

        let next: CartItem[];

        if (idx >= 0) {
          next = [...items];
          const nextQty = Math.min(10, next[idx].quantity + qty);
          next[idx] = { ...next[idx], quantity: nextQty };
        } else {
          next = [...items, { ...item, quantity: Math.min(10, qty) }];
        }

        set({ items: next, isOpen: true });

        const saved = next.find(
          (i) => keyOf(i.productId, i.size) === keyOf(item.productId, item.size),
        );
        if (saved) void saveCartItem(saved);
      },

      removeItem: (productId, size) => {
        set({
          items: get().items.filter(
            (i) => keyOf(i.productId, i.size) !== keyOf(productId, size),
          ),
        });

        void deleteCartItem(productId, size);
      },

      updateQuantity: (productId, size, quantity) => {
        const q = Math.max(1, Math.min(10, quantity));
        const next = get().items.map((i) =>
          keyOf(i.productId, i.size) === keyOf(productId, size)
            ? { ...i, quantity: q }
            : i,
        );

        set({ items: next });

        const updated = next.find(
          (i) => keyOf(i.productId, i.size) === keyOf(productId, size),
        );
        if (updated) void saveCartItem(updated);
      },

      clearCart: () => {
        const oldItems = get().items;
        set({ items: [] });

        for (const item of oldItems) {
          void deleteCartItem(item.productId, item.size);
        }
      },

      loadFromFirestore: async () => {
        const user = firebaseAuth.currentUser;
        if (!user) {
          set({ firestoreReady: false });
          return;
        }

        const cartRef = collection(firebaseDb, "customers", user.uid, "cart");
        const snapshot = await getDocs(cartRef);

        const firestoreItems = snapshot.docs.map((itemDoc) => {
          const data = itemDoc.data() as CartItem;
          return data;
        });

        set({
          items: firestoreItems,
          firestoreReady: true,
        });
      },

      syncToFirestore: async () => {
        const user = firebaseAuth.currentUser;
        if (!user) return;

        await Promise.all(get().items.map((item) => saveCartItem(item)));
      },
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