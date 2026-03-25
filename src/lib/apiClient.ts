import axios from 'axios';

// Create a centralized Axios instance
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Since we are using Clerk for auth, fetching the token must happen dynamically per request
// because the token is managed by Clerk natively. We can export an initialization helper
// to securely bind Clerk's `getToken` logic into Axios at runtime inside our app context.

export function setupApiInterceptors(getToken: () => Promise<string | null>) {
  // Clear existing interceptors on remounts
  apiClient.interceptors.request.clear();
  apiClient.interceptors.response.clear();

  // Request Interceptor: Attach the short-lived JWT securely on every outgoing request
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

  // Response Interceptor: Handle rate limiting and unauthorized errors gracefully
  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        // Handle unauthorized token errors natively (e.g., prompt re-login)
        console.warn('Unauthorized request. Token might be expired or invalid.');
      } else if (error.response?.status === 429) {
        // Phase 4 stub: implement exponential backoff here if desired
        console.warn('Rate limit exceeded (HTTP 429). Retry in a moment.');
      }
      return Promise.reject(error);
    }
  );
}
