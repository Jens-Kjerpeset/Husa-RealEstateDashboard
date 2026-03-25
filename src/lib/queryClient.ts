import { QueryClient } from '@tanstack/react-query';

// Configure the global query client with sensible defaults for server-state caching
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes (data remains fresh)
      gcTime: 1000 * 60 * 15, // 15 minutes (garbage collection)
      retry: 2, // Retry failed requests twice before throwing error
      refetchOnWindowFocus: false, // Prevents aggressive network calls when toggling tabs
    },
    mutations: {
      retry: 1, // Only retry mutations once safely
    },
  },
});
