import { useAuth } from '@clerk/clerk-react';
import { fetchWithErrorHandling } from '@/services/api';

export function useAuthenticatedApi() {
  const { getToken } = useAuth();

  const authenticatedFetch = async (url: string, options?: RequestInit) => {
    const token = await getToken();
    return fetchWithErrorHandling(url, {
      ...options,
      token,
    });
  };

  return { authenticatedFetch };
}