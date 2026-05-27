import { create } from "zustand";

export type AuthProvider =
  | "email"
  | "google"
  | "facebook"
  | "apple"
  | "otp";

export type AuthUser = {
  uid?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  pincode?: string;
  provider?: AuthProvider;
  emailVerified?: boolean;
  phoneVerified?: boolean;
};

type AuthState = {
  loginModalOpen: boolean;
  registerModalOpen: boolean;

  isAuthenticated: boolean;
  authLoading: boolean;

  user: AuthUser | null;

  setLoginModalOpen: (open: boolean) => void;
  setRegisterModalOpen: (open: boolean) => void;

  setAuthLoading: (loading: boolean) => void;

  setAuthenticated: (
    value: boolean,
    user?: AuthUser | null
  ) => void;

  setUser: (user: AuthUser | null) => void;

  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  loginModalOpen: false,
  registerModalOpen: false,

  isAuthenticated: false,
  authLoading: true,

  user: null,

  setLoginModalOpen: (open) =>
    set({
      loginModalOpen: open,
    }),

  setRegisterModalOpen: (open) =>
    set({
      registerModalOpen: open,
    }),

  setAuthLoading: (loading) =>
    set({
      authLoading: loading,
    }),

  setAuthenticated: (value, user) =>
    set({
      isAuthenticated: value,
      user: value ? user ?? null : null,
      authLoading: false,
    }),

  setUser: (user) =>
    set({
      user,
      isAuthenticated: Boolean(user),
      authLoading: false,
    }),

  logout: () =>
    set({
      isAuthenticated: false,
      user: null,
      authLoading: false,
    }),
}));