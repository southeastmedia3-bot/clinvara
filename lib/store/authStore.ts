import { create } from "zustand";

export type AuthUser = {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  provider?: "email" | "google" | "facebook" | "apple" | "otp";
};

type AuthState = {
  loginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
  registerModalOpen: boolean;
  setRegisterModalOpen: (open: boolean) => void;
  isAuthenticated: boolean;
  user: AuthUser | null;
  setAuthenticated: (v: boolean, user?: AuthUser) => void;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  loginModalOpen: false,
  setLoginModalOpen: (open) => set({ loginModalOpen: open }),
  registerModalOpen: false,
  setRegisterModalOpen: (open) => set({ registerModalOpen: open }),
  isAuthenticated: false,
  user: null,
  setAuthenticated: (v, user) =>
    set({
      isAuthenticated: v,
      user: v ? (user ?? { provider: "email" }) : null,
    }),
  setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
  logout: () => set({ isAuthenticated: false, user: null }),
}));
