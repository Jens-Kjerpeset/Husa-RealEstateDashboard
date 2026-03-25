import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { useAuth } from '@clerk/clerk-react';
import { db } from '../lib/firebase';
import type { Property } from './useProperties';

// In a real app, 'id' is unique, but this simulates the document schema
interface SavedPropertyRef {
  id: string;
  address: string;
  price: number;
  savedAt: number;
}

const getSavedProperties = async (userId: string): Promise<SavedPropertyRef[]> => {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data().savedProperties || [];
  }
  return [];
};

export const useSavedProperties = () => {
  const { userId } = useAuth();

  return useQuery({
    queryKey: ['savedProperties', userId],
    queryFn: () => getSavedProperties(userId as string),
    enabled: !!userId,
  });
};

export const useSavePropertyMutation = () => {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (property: Property) => {
      if (!userId) throw new Error("Must be logged in to save properties");
      const docRef = doc(db, 'users', userId);
      const savedItem: SavedPropertyRef = { 
        ...property, 
        savedAt: Date.now() 
      };
      // Optimistically push to array using Firestore logic
      await setDoc(docRef, { savedProperties: arrayUnion(savedItem) }, { merge: true });
      return savedItem;
    },
    onMutate: async (newProperty) => {
      const queryKey = ['savedProperties', userId];
      // Cancel any outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey });
      
      const previousProperties = queryClient.getQueryData<SavedPropertyRef[]>(queryKey) || [];
      const tempItem: SavedPropertyRef = { ...newProperty, savedAt: Date.now() };

      queryClient.setQueryData<SavedPropertyRef[]>(queryKey, (old) => {
        return old ? [...old, tempItem] : [tempItem];
      });

      return { previousProperties };
    },
    onError: (_err, _newProp, context) => {
      // Revert optimism if there's an error (e.g. invalid Firebase config locally)
      queryClient.setQueryData(['savedProperties', userId], context?.previousProperties);
    },
    onSettled: () => {
      // Sync with server if successfully written or failed
      queryClient.invalidateQueries({ queryKey: ['savedProperties', userId] });
    },
  });
};

export const useRemovePropertyMutation = () => {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (propertyId: string) => {
      if (!userId) throw new Error("Must be logged in to remove properties");
      const docRef = doc(db, 'users', userId);
      const queryKey = ['savedProperties', userId];
      
      let currentItems = queryClient.getQueryData<SavedPropertyRef[]>(queryKey);
      if (!currentItems) {
        const docSnap = await getDoc(docRef);
        currentItems = docSnap.exists() ? docSnap.data().savedProperties || [] : [];
      }
      
      const newItems = (currentItems || []).filter((item: SavedPropertyRef) => item.id !== propertyId);
      await setDoc(docRef, { savedProperties: newItems }, { merge: true });
      return propertyId;
    },
    onMutate: async (propertyId) => {
      const queryKey = ['savedProperties', userId];
      await queryClient.cancelQueries({ queryKey });
      
      const previousProperties = queryClient.getQueryData<SavedPropertyRef[]>(queryKey) || [];
      queryClient.setQueryData<SavedPropertyRef[]>(queryKey, (old: SavedPropertyRef[] | undefined) => {
        return old ? old.filter(item => item.id !== propertyId) : [];
      });

      return { previousProperties };
    },
    onError: (_err, _newProp, context) => {
      queryClient.setQueryData(['savedProperties', userId], context?.previousProperties);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['savedProperties', userId] });
    },
  });
};
