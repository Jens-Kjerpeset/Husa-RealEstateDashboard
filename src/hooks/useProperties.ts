import { useInfiniteQuery, useSuspenseInfiniteQuery, useQuery } from '@tanstack/react-query';

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

const SANITY_PROJECT_ID = 'dmr6zdyg';
const SANITY_DATASET = 'production';
const SANITY_API_VERSION = 'v2023-01-01';
const SANITY_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/${SANITY_API_VERSION}/data/query/${SANITY_DATASET}`;

const fetchProperties = async (pageParam = 0, search = ''): Promise<{ data: Property[], nextCursor: number | null }> => {
  const ITEMS_PER_PAGE = 8;
  const start = pageParam * ITEMS_PER_PAGE;
  // Fetch one extra item to check if there is a next page
  const end = start + ITEMS_PER_PAGE; 
  
  const filter = search ? ` && (city match "*${search}*" || zipCode match "*${search}*" || address match "*${search}*")` : '';
  const query = encodeURIComponent(`*[_type == "property"${filter}] | order(price desc) [${start}...${end + 1}]`);
  
  const response = await fetch(`${SANITY_URL}?query=${query}`);
  if (!response.ok) {
    throw new Error('Failed to fetch from Sanity Headless CMS');
  }
  
  const json = await response.json();
  const results = json.result || [];
  
  const data: Property[] = results.slice(0, ITEMS_PER_PAGE).map((doc: any) => ({
    id: doc.propId?.toString() || doc._id,
    address: doc.address,
    city: doc.city,
    zipCode: doc.zipCode,
    price: doc.price,
    bedrooms: doc.bedrooms,
    bathrooms: doc.bathrooms,
    squareMeters: doc.squareMeters,
    energyGrade: doc.energyGrade,
    imageUrl: doc.imageUrl,
    lat: doc.lat,
    lng: doc.lng
  }));

  const hasNextPage = results.length > ITEMS_PER_PAGE;
  
  return {
    data,
    nextCursor: hasNextPage ? pageParam + 1 : null,
  };
};

export const useProperties = (search = '') => {
  return useInfiniteQuery({
    queryKey: ['properties', search],
    queryFn: ({ pageParam = 0 }) => fetchProperties(pageParam, search),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
};

export const useSuspenseProperties = (search = '') => {
  return useSuspenseInfiniteQuery({
    queryKey: ['properties', search],
    queryFn: ({ pageParam = 0 }) => fetchProperties(pageParam, search),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
};

const fetchPropertiesByIds = async (ids: string[]): Promise<Property[]> => {
  if (!ids || ids.length === 0) return [];
  
  const idList = ids.map(id => `"${id}"`).join(', ');
  const query = encodeURIComponent(`*[_type == "property" && (propId in [${idList}] || _id in [${idList}])]`);
  
  const response = await fetch(`${SANITY_URL}?query=${query}`);
  if (!response.ok) {
    throw new Error('Failed to fetch saved properties from Sanity');
  }
  
  const json = await response.json();
  const results = json.result || [];
  
  return results.map((doc: any) => ({
    id: doc.propId?.toString() || doc._id,
    address: doc.address,
    city: doc.city,
    zipCode: doc.zipCode,
    price: doc.price,
    bedrooms: doc.bedrooms,
    bathrooms: doc.bathrooms,
    squareMeters: doc.squareMeters,
    energyGrade: doc.energyGrade,
    imageUrl: doc.imageUrl,
    lat: doc.lat,
    lng: doc.lng
  }));
};

export const usePropertiesByIds = (ids: string[]) => {
  return useQuery({
    queryKey: ['properties', 'byIds', ids],
    queryFn: () => fetchPropertiesByIds(ids),
    enabled: ids.length > 0,
  });
};
