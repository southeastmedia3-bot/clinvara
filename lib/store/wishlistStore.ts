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
import { firebaseAuth, firebaseDb } from "@/lib/firebase/client";

type WishlistState = {
  productIds: string[];
  firestoreReady: boolean;

  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
  count: () => number;
  clear: () => void;

  loadFromFirestore: () => Promise<void>;
  syncToFirestore: () => Promise<void>;
};

async function saveWishlistItem(productId: string) {
  const user = firebaseAuth.currentUser;
  if (!user) return;

  await setDoc(
    doc(firebaseDb, "customers", user.uid, "wishlist", productId),
    {
      productId,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

async function deleteWishlistItem(productId: string) {
  const user = firebaseAuth.currentUser;
  if (!user) return;

  await deleteDoc(doc(firebaseDb, "customers", user.uid, "wishlist", productId));
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      firestoreReady: false,

      toggle: (productId) => {
        const cur = get().productIds;
        const exists = cur.includes(productId);

        if (exists) {
          set({ productIds: cur.filter((id) => id !== productId) });
          void deleteWishlistItem(productId);
        } else {
          set({ productIds: [...cur, productId] });
          void saveWishlistItem(productId);
        }
      },

      has: (productId) => get().productIds.includes(productId),

      count: () => get().productIds.length,

      clear: () => set({ productIds: [], firestoreReady: false }),

      loadFromFirestore: async () => {
        const user = firebaseAuth.currentUser;
        if (!user) {
          set({ firestoreReady: false });
          return;
        }

        const wishlistRef = collection(firebaseDb, "customers", user.uid, "wishlist");
        const snapshot = await getDocs(wishlistRef);

        set({
          productIds: snapshot.docs
            .map((itemDoc) => String(itemDoc.data().productId ?? itemDoc.id))
            .filter(Boolean),
          firestoreReady: true,
        });
      },

      syncToFirestore: async () => {
        const user = firebaseAuth.currentUser;
        if (!user) return;

        await Promise.all(get().productIds.map((productId) => saveWishlistItem(productId)));
      },
    }),
    {
      name: "clinvara-wishlist",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
