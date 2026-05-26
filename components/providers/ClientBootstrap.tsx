"use client";

import { useEffect, type ReactNode } from "react";
import { useCartStore } from "@/lib/store/cartStore";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { useAuthStore } from "@/lib/store/authStore";
import { apiUrl } from "@/lib/api/client";
import { firebaseAuth } from "@/lib/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import {
  customerToAuthUser,
  ensureCustomerFromFirebaseUser,
  readCustomerProfile,
} from "@/lib/firebase/customerData";

export function ClientBootstrap({ children }: { children: ReactNode }) {
  useEffect(() => {
    void useCartStore.persist.rehydrate();
    void useWishlistStore.persist.rehydrate();
    void fetch(apiUrl("/api/auth/session"), { credentials: "include" })
      .then((response) => response.json())
      .then((data) => {
        if (data?.user) {
          useAuthStore.getState().setAuthenticated(true, {
            name: data.user.name,
            email: data.user.email,
            phone: data.user.phone,
            provider: data.user.provider,
          });
        }
      })
      .catch(() => undefined);
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      if (!user) return;
      void readCustomerProfile(user.uid)
        .then((profile) => profile ?? ensureCustomerFromFirebaseUser(user))
        .then((profile) => {
          useAuthStore.getState().setAuthenticated(true, customerToAuthUser(profile));
        })
        .catch(() => {
          useAuthStore.getState().setAuthenticated(true, {
            uid: user.uid,
            name: user.displayName ?? undefined,
            email: user.email ?? undefined,
            phone: user.phoneNumber ?? undefined,
            provider: user.phoneNumber ? "otp" : "email",
          });
        });
    });
    return unsubscribe;
  }, []);
  return <>{children}</>;
}
