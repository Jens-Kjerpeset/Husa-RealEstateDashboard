import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export function setupApiInterceptors(getToken: () => Promise<string | null>) {
  apiClient.interceptors.request.clear();
  apiClient.interceptors.response.clear();

  apiClient.interceptors.request.use(
    async (config) => {
      try {
        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      } catch (error) {
        return Promise.reject(error);
      }
    },
    (error) => Promise.reject(error)
  );

  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        console.warn('Unauthorized request. Token might be expired or invalid.');
      } else if (error.response?.status === 429) {
        console.warn('Rate limit exceeded (HTTP 429). Retry in a moment.');
      }
      return Promise.reject(error);
    }
  );
}
