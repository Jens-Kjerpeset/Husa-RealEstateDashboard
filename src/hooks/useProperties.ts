import { useInfiniteQuery, useSuspenseInfiniteQuery } from '@tanstack/react-query';

export interface Property {
  id: string;
  address: string;
  price: number;
}

interface FetchPropertiesResponse {
  data: Property[];
  nextCursor?: number;
}

// Mock API call since we don't have a real property API key setup yet.
// In a real scenario, this uses the apiClient directly.
const fetchProperties = async ({ pageParam = 0 }): Promise<FetchPropertiesResponse> => {
  // await apiClient.get('/properties', { params: { cursor: pageParam } })
  
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // Simulate random error to demonstrate ErrorBoundary
  if (Math.random() < 0.2) {
    throw new Error('Failed to fetch properties API');
  }

  const offset = pageParam * 10;
  const mockData = Array.from({ length: 10 }).map((_, i) => ({
    id: `prop-${offset + i}`,
    address: `${offset + i + 1} Main St, Real Estate City`,
    price: 300000 + (offset + i) * 10000,
  }));

  return {
    data: mockData,
    nextCursor: pageParam < 5 ? pageParam + 1 : undefined,
  };
};

export const useProperties = () => {
  return useInfiniteQuery({
    queryKey: ['properties'],
    queryFn: fetchProperties,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
};

// For React Suspense demonstration
export const useSuspenseProperties = () => {
  return useSuspenseInfiniteQuery({
    queryKey: ['properties-suspense'],
    queryFn: fetchProperties,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
};
