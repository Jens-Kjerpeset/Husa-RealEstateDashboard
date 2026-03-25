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
  const norwegianStreets = ['Storgata', 'Kirkeveien', 'Karl Johans gate', 'Bogstadveien', 'Dronning Eufemias gate'];
const norwegianCities = ['Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Kristiansand'];

const allDummyData: Property[] = Array.from({ length: 100 }, (_, i) => {
  const street = norwegianStreets[Math.floor(Math.random() * norwegianStreets.length)];
  const city = norwegianCities[Math.floor(i / 20) % norwegianCities.length];
  return {
    id: `prop-${i}`,
    address: `${street} ${Math.floor(Math.random() * 100) + 1}, ${city}`,
    price: Math.floor(Math.random() * 15000000) + 3000000, // 3M to 18M NOK
  };
});

  const mockData = allDummyData.slice(offset, offset + 10);

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
