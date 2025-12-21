import { create } from 'zustand';
import { User } from 'firebase/auth';

interface UserData {
  uid: string;
  email: string;
  name: string;
  phone?: string;
  role?: 'admin' | 'customer';
}

interface AuthState {
  user: UserData | null;
  firebaseUser: User | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  setUser: (user: UserData | null) => void;
  setFirebaseUser: (user: User | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  firebaseUser: null,
  isAdmin: false,
  loading: true,
  error: null,

  setUser: (user) => set({ user }),
  setFirebaseUser: (firebaseUser) => set({ firebaseUser }),
  setIsAdmin: (isAdmin) => set({ isAdmin }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  logout: () => {
    set({
      user: null,
      firebaseUser: null,
      isAdmin: false,
      error: null,
    });
  },

  checkAuth: async () => {
    // This will be implemented in authService
    set({ loading: false });
  },
}));

