"use client";

import { useEffect, type ReactNode } from "react";
import { useCartStore } from "@/lib/store/cartStore";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { useAuthStore } from "@/lib/store/authStore";
import { apiUrl } from "@/lib/api/client";
import { firebaseAuth } from "@/lib/firebase/client";
import { onAuthStateChanged } from "firebase/auth";

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
      const provider = user.phoneNumber ? "otp" : "email";
      useAuthStore.getState().setAuthenticated(true, {
        name: user.displayName ?? undefined,
        email: user.email ?? undefined,
        phone: user.phoneNumber ?? undefined,
        provider,
      });
    });
    return unsubscribe;
  }, []);
  return <>{children}</>;
}
