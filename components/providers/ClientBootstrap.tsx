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
      const isGoogleLogin = user.providerData.some(
        (item) => item.providerId === "google.com",
      );
      const isFacebookLogin = user.providerData.some(
        (item) => item.providerId === "facebook.com",
      );
      const isSocialLogin = isGoogleLogin || isFacebookLogin;

      const isVerifiedLogin =
        isPhoneLogin || isVerifiedEmailLogin || isSocialLogin;

      if (!isVerifiedLogin) {
        store.logout();
        return;
      }

      const provider = isPhoneLogin
        ? "otp"
        : isGoogleLogin
          ? "google"
          : isFacebookLogin
            ? "facebook"
            : "email";

      try {
        const profile = await ensureCustomerFromFirebaseUser(user, {
          name: user.displayName ?? undefined,
          email: user.email ?? undefined,
          phone: user.phoneNumber ?? undefined,
          provider,
        });

        store.setAuthenticated(true, {
          ...customerToAuthUser(profile),
          uid: user.uid,
          name:
            profile.name ||
            user.displayName ||
            user.email?.split("@")[0] ||
            "CLINVARA member",
          email: profile.email || user.email || undefined,
          phone: profile.phone || user.phoneNumber || undefined,
          provider,
          emailVerified: Boolean(user.emailVerified),
          phoneVerified: Boolean(user.phoneNumber),
        });

        await syncCustomerData();
      } catch {
        store.setAuthenticated(true, {
          uid: user.uid,
          name:
            user.displayName ||
            user.email?.split("@")[0] ||
            user.phoneNumber ||
            "CLINVARA member",
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