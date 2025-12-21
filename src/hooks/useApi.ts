import { useState, useEffect } from 'react';
import axios, { AxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { API_ENDPOINTS } from '@/utils/constants';

interface UseApiOptions {
  immediate?: boolean;
}

export const useApi = <T = any>(
  url: string,
  options: UseApiOptions = { immediate: true }
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { firebaseUser } = useAuthStore();

  const execute = async (config?: AxiosRequestConfig) => {
    setLoading(true);
    setError(null);

    try {
      // Get Firebase ID token
      let token = null;
      if (firebaseUser) {
        token = await firebaseUser.getIdToken();
      }

      const response = await axios({
        url: url.startsWith('http') ? url : `${API_ENDPOINTS.BASE_URL}${url}`,
        ...config,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...config?.headers,
        },
      });

      setData(response.data);
      return response.data;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);

      // Handle 401 errors
      if (err.response?.status === 401) {
        // Redirect to login
        window.location.href = '/login';
      }

      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options.immediate) {
      execute();
    }
  }, []);

  return { data, loading, error, execute };
};

