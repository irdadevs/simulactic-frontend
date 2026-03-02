import { create } from "zustand";
import { UserProps } from "../types/user.types";

type AuthState = {
  user: UserProps | null;
  isAuthenticated: boolean;
  setAuthenticatedUser: (user: UserProps) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setAuthenticatedUser: (user) => set({ user, isAuthenticated: true }),
  clearSession: () => set({ user: null, isAuthenticated: false }),
}));
