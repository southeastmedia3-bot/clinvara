"use client";

import { useEffect, type ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useCartStore } from "@/lib/store/cartStore";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { useAuthStore } from "@/lib/store/authStore";
import { firebaseAuth } from "@/lib/firebase/client";
import {
  customerToAuthUser,
  ensureCustomerFromFirebaseUser,
  readCustomerProfile,
} from "@/lib/firebase/customerData";

export function ClientBootstrap({ children }: { children: ReactNode }) {
  useEffect(() => {
    void useCartStore.persist.rehydrate();
    void useWishlistStore.persist.rehydrate();

    const authStore = useAuthStore.getState();
    authStore.setAuthLoading(true);

    const syncCustomerData = async () => {
      await useCartStore.getState().syncToFirestore();
      await useWishlistStore.getState().syncToFirestore();

      await useCartStore.getState().loadFromFirestore();
      await useWishlistStore.getState().loadFromFirestore();
    };

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      const store = useAuthStore.getState();

      if (!user) {
        store.logout();
        return;
      }

      const isPhoneLogin = Boolean(user.phoneNumber);
      const isVerifiedEmailLogin = Boolean(user.email && user.emailVerified);
      const isSocialLogin = user.providerData.some((provider) =>
        ["google.com", "facebook.com"].includes(provider.providerId),
      );

      const isVerifiedLogin = isPhoneLogin || isVerifiedEmailLogin || isSocialLogin;

      if (!isVerifiedLogin) {
        store.logout();
        return;
      }

      const provider = isPhoneLogin
        ? "otp"
        : user.providerData.some((item) => item.providerId === "google.com")
          ? "google"
          : user.providerData.some((item) => item.providerId === "facebook.com")
            ? "facebook"
            : "email";

      try {
        const profile =
          (await readCustomerProfile(user.uid)) ??
          (await ensureCustomerFromFirebaseUser(user, {
            email: user.email ?? undefined,
            phone: user.phoneNumber ?? undefined,
            provider,
          }));

        store.setAuthenticated(true, customerToAuthUser(profile));

        await syncCustomerData();
      } catch {
        store.setAuthenticated(true, {
          uid: user.uid,
          name: user.displayName ?? undefined,
          email: user.email ?? undefined,
          phone: user.phoneNumber ?? undefined,
          provider,
          emailVerified: Boolean(user.emailVerified),
          phoneVerified: Boolean(user.phoneNumber),
        });

        await syncCustomerData();
      }
    });

    return unsubscribe;
  }, []);

  return <>{children}</>;
}