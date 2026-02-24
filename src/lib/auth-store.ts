import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'student' | 'alumni';

export interface UserProfile {
  id: string;
  fullName: string;
  idNumber: string;
  address: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  role?: UserRole;
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
  }) => { ok: true } | { ok: false; error: string };
  login: (payload: { identifier: string; password: string }) =>
    | { ok: true }
    | { ok: false; error: 'account_not_found' | 'incorrect_password' | 'missing_identifier' };
  logout: () => void;
  updateCurrentUser: (profile: Partial<Pick<UserProfile, 'fullName' | 'address'>>) => void;
  isAuthenticated: () => boolean;
}

const hashPassword = (password: string) => {
  // Simple reversible "hash" for demo purposes only.
  return btoa(password);
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      users: [],
      register: ({ fullName, idNumber, address, email, password, role }) => {
        const { users } = get();
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedId = idNumber.trim();

        if (!trimmedEmail || !trimmedId) {
          return { ok: false, error: 'Email and ID Number are required.' };
        }

        if (users.some((u) => u.email.toLowerCase() === trimmedEmail)) {
          return { ok: false, error: 'Email is already registered.' };
        }

        if (users.some((u) => u.idNumber === trimmedId)) {
          return { ok: false, error: 'ID Number is already registered.' };
        }

        const now = new Date().toISOString();
        const newUser: UserProfile = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          fullName: fullName.trim(),
          idNumber: trimmedId,
          address: address.trim(),
          email: trimmedEmail,
          passwordHash: hashPassword(password),
          createdAt: now,
          role,
        };

        set((state) => ({
          users: [...state.users, newUser],
          user: newUser,
        }));

        return { ok: true };
      },
      login: ({ identifier, password }) => {
        const trimmed = identifier.trim();
        if (!trimmed) {
          return { ok: false, error: 'missing_identifier' };
        }

        const { users } = get();
        const lower = trimmed.toLowerCase();
        const user =
          users.find((u) => u.email.toLowerCase() === lower) ||
          users.find((u) => u.idNumber === trimmed);

        if (!user) {
          return { ok: false, error: 'account_not_found' };
        }

        if (user.passwordHash !== hashPassword(password)) {
          return { ok: false, error: 'incorrect_password' };
        }

        set({ user });
        return { ok: true };
      },
      logout: () => set({ user: null }),
      updateCurrentUser: (profile) =>
        set((state) => {
          if (!state.user) return state;
          const updatedUser = { ...state.user, ...profile };
          return {
            user: updatedUser,
            users: state.users.map((u) => (u.id === state.user?.id ? updatedUser : u)),
          };
        }),
      isAuthenticated: () => !!get().user,
    }),
    {
      name: 'apex-auth',
      partialize: (state) => ({ user: state.user, users: state.users }),
    }
  )
);

