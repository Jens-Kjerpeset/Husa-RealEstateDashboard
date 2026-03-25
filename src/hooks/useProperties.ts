import { useInfiniteQuery, useSuspenseInfiniteQuery } from '@tanstack/react-query';
import propertiesData from '../data/properties.json';

export interface Property {
  id: string;
  address: string;
  city: string;
  zipCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareMeters: number;
  energyGrade: string;
  imageUrl: string;
  lat: number;
  lng: number;
}

const fetchProperties = async (pageParam = 0): Promise<{ data: Property[], nextCursor: number | null }> => {
  // Simulate network latency (200-600ms)
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 400 + 200));

  const offset = pageParam * 10;
  const mockData = propertiesData.slice(offset, offset + 10) as Property[];

  return {
    data: mockData,
    nextCursor: offset + 10 < propertiesData.length ? pageParam + 1 : null,
  };
};

export const useProperties = () => {
  return useInfiniteQuery({
    queryKey: ['properties'],
    queryFn: ({ pageParam = 0 }) => fetchProperties(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
};

export const useSuspenseProperties = () => {
  return useSuspenseInfiniteQuery({
    queryKey: ['properties'],
    queryFn: ({ pageParam = 0 }) => fetchProperties(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
};
