import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiFetch, setTokens, clearTokens, getAccessToken } from "@/lib/api";

export type UserRole = "customer" | "admin";

export interface UserProfile {
  id: string;
  fullName: string;
  idNumber: string;
  address: string;
  email: string;
  passwordHash?: string;
  createdAt?: string;
  role?: UserRole;
  isAdmin?: boolean;
  isDisabled?: boolean;
}

function apiUserToProfile(apiUser: {
  id: string;
  fullName: string;
  idNumber: string;
  email: string;
  role: string;
  isActive: boolean;
}): UserProfile {
  return {
    id: apiUser.id,
    fullName: apiUser.fullName,
    idNumber: apiUser.idNumber,
    address: "",
    email: apiUser.email,
    role: apiUser.role === "ADMIN" ? "admin" : "customer",
    isAdmin: apiUser.role === "ADMIN",
    isDisabled: !apiUser.isActive,
  };
}

export interface AuthState {
  user: UserProfile | null;
  users: UserProfile[];
  register: (payload: {
    fullName: string;
    idNumber: string;
    address: string;
    email: string;
    password: string;
    role?: UserRole;
  }) => Promise<{ ok: true } | { ok: false; error: string }>;
  login: (payload: { identifier: string; password: string }) => Promise<
    | { ok: true }
    | { ok: false; error: "account_not_found" | "incorrect_password" | "missing_identifier" }
  >;
  logout: () => Promise<void>;
  updateCurrentUser: (profile: Partial<Pick<UserProfile, "fullName" | "address">>) => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  setUserDisabled: (id: string, disabled: boolean) => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      users: [],

      register: async (payload) => {
        try {
          const res = await apiFetch("/api/auth/register", {
            method: "POST",
            body: JSON.stringify({
              fullName: payload.fullName,
              idNumber: payload.idNumber,
              address: payload.address,
              email: payload.email,
              password: payload.password,
            }),
            skipAuth: true,
          });
          if (res.status === 409) {
            const err = await res.json().catch(() => ({}));
            const msg = (err as { error?: { message?: string } })?.error?.message;
            return { ok: false, error: msg ?? "Email or ID Number already registered." };
          }
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            const msg = (err as { error?: { message?: string } })?.error?.message;
            return { ok: false, error: msg ?? "Registration failed." };
          }
          const data = (await res.json()) as { user: Parameters<typeof apiUserToProfile>[0] };
          set({ user: apiUserToProfile(data.user) });
          const loginRes = await apiFetch("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({
              identifier: payload.email,
              password: payload.password,
            }),
            skipAuth: true,
          });
          if (loginRes.ok) {
            const loginData = (await loginRes.json()) as {
              user: Parameters<typeof apiUserToProfile>[0];
              accessToken: string;
              refreshToken: string;
            };
            setTokens(loginData.accessToken, loginData.refreshToken);
            set({ user: apiUserToProfile(loginData.user) });
          }
          return { ok: true };
        } catch {
          return { ok: false, error: "Registration failed. Please try again." };
        }
      },

      login: async ({ identifier, password }) => {
        const trimmed = identifier.trim();
        if (!trimmed) {
          return { ok: false, error: "missing_identifier" };
        }
        try {
          const res = await apiFetch("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ identifier: trimmed, password }),
            skipAuth: true,
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            const code = (err as { error?: { code?: string } })?.error?.code;
            if (code === "INVALID_CREDENTIALS") {
              return { ok: false, error: "incorrect_password" };
            }
            return { ok: false, error: "account_not_found" };
          }
          const data = (await res.json()) as {
            user: Parameters<typeof apiUserToProfile>[0];
            accessToken: string;
            refreshToken: string;
          };
          setTokens(data.accessToken, data.refreshToken);
          set({ user: apiUserToProfile(data.user) });
          return { ok: true };
        } catch {
          return { ok: false, error: "account_not_found" };
        }
      },

      logout: async () => {
        const refresh = (await import("@/lib/api")).getRefreshToken();
        if (refresh) {
          try {
            await apiFetch("/api/auth/logout", {
              method: "POST",
              body: JSON.stringify({ refreshToken: refresh }),
              skipAuth: true,
            });
          } catch {
            /* ignore */
          }
        }
        clearTokens();
        set({ user: null });
      },

      updateCurrentUser: (profile) =>
        set((state) => {
          if (!state.user) return state;
          const updatedUser = { ...state.user, ...profile };
          return { user: updatedUser };
        }),

      isAuthenticated: () => !!get().user || !!getAccessToken(),
      isAdmin: () => !!get().user?.isAdmin,

      setUserDisabled: (id, disabled) =>
        set((state) => ({
          user:
            state.user && state.user.id === id
              ? { ...state.user, isDisabled: disabled }
              : state.user,
        })),

      fetchMe: async () => {
        if (!getAccessToken()) return;
        try {
          const res = await apiFetch("/api/auth/me");
          if (!res.ok) {
            clearTokens();
            set({ user: null });
            return;
          }
          const data = (await res.json()) as { user: Parameters<typeof apiUserToProfile>[0] };
          set({ user: apiUserToProfile(data.user) });
        } catch {
          set({ user: null });
        }
      },
    }),
    {
      name: "apex-auth",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
