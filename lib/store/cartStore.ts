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
  refreshLatestPrices: () => Promise<void>;

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

const cartOperationQueues = new Map<string, Promise<void>>();

function enqueueCartOperation(key: string, operation: () => Promise<void>) {
  const previous = cartOperationQueues.get(key) || Promise.resolve();
  const next = previous
    .catch(() => undefined)
    .then(operation)
    .finally(() => {
      if (cartOperationQueues.get(key) === next) {
        cartOperationQueues.delete(key);
      }
    });
  cartOperationQueues.set(key, next);
  return next;
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
        if (saved) {
          const key = keyOf(saved.productId, saved.size);
          void enqueueCartOperation(key, () => saveCartItem(saved));
        }
      },

      removeItem: (productId, size) => {
        const key = keyOf(productId, size);
        set({
          items: get().items.filter(
            (i) => keyOf(i.productId, i.size) !== key,
          ),
        });

        void enqueueCartOperation(key, () => deleteCartItem(productId, size));
      },

      updateQuantity: (productId, size, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, size);
          return;
        }

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
        if (updated) {
          const key = keyOf(updated.productId, updated.size);
          void enqueueCartOperation(key, () => saveCartItem(updated));
        }
      },

      clearCart: () => {
        const oldItems = get().items;
        set({ items: [] });

        for (const item of oldItems) {
          const key = keyOf(item.productId, item.size);
          void enqueueCartOperation(key, () => deleteCartItem(item.productId, item.size));
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

        await Promise.all(
          get().items.map((item) =>
            enqueueCartOperation(keyOf(item.productId, item.size), () => saveCartItem(item)),
          ),
        );
      },

      refreshLatestPrices: async () => {
        const items = get().items;
        if (!items.length) return;

        const response = await fetch("/api/products", { cache: "no-store" }).catch(
          () => null,
        );
        if (!response?.ok) return;
        const data = (await response.json().catch(() => null)) as {
          products?: Array<Partial<CartItem> & { id?: string; slug?: string; price?: number; image?: string; name?: string; dispatchTimeDays?: number }>;
        } | null;
        const products = data?.products || [];
        const next = items.map((item) => {
          const product = products.find(
            (entry) => entry.id === item.productId || entry.slug === item.slug,
          );
          if (!product) return item;
          return {
            ...item,
            price: Number(product.price ?? item.price),
            name: product.name || item.name,
            image: product.image || item.image,
            slug: product.slug || item.slug,
            dispatchTimeDays: Number(product.dispatchTimeDays ?? item.dispatchTimeDays ?? 1),
          };
        });
        set({ items: next });
        await Promise.all(
          next.map((item) =>
            enqueueCartOperation(keyOf(item.productId, item.size), () => saveCartItem(item)),
          ),
        );
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
