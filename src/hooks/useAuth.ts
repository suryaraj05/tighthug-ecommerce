import { useAuthStore } from '@/stores/authStore';
import { login, signup, logout } from '@/services/authService';
import { LoginData, SignupData } from '@/services/authService';

export const useAuth = () => {
  const { user, isAdmin, loading, error } = useAuthStore();

  return {
    user,
    isAdmin,
    loading,
    error,
    login: async (data: LoginData) => {
      try {
        await login(data);
      } catch (error: any) {
        throw error;
      }
    },
    signup: async (data: SignupData) => {
      try {
        await signup(data);
      } catch (error: any) {
        throw error;
      }
    },
    logout: async () => {
      try {
        await logout();
      } catch (error: any) {
        throw error;
      }
    },
  };
};

