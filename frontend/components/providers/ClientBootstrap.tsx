"use client";

import { useEffect, type ReactNode } from "react";
import { useCartStore } from "@/lib/store/cartStore";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { useAuthStore } from "@/lib/store/authStore";
import { apiUrl } from "@/lib/api/client";

export function ClientBootstrap({ children }: { children: ReactNode }) {
  useEffect(() => {
    void useCartStore.persist.rehydrate();
    void useWishlistStore.persist.rehydrate();
    void fetch(apiUrl("/api/auth/session"), { credentials: "include" })
      .then((response) => response.json())
      .then((data) => {
        if (data?.user) useAuthStore.getState().setAuthenticated(true);
      })
      .catch(() => undefined);
  }, []);
  return <>{children}</>;
}
