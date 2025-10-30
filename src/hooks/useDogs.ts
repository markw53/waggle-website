// src/hooks/useDogs.ts
import { useState, useEffect, useCallback } from 'react';
import {
  collection, getDocs, doc, addDoc,
  updateDoc, deleteDoc, query, where
} from 'firebase/firestore';
import { db } from '@/firebase';
import type { Dog } from '@/types/dog';
import { useAuth } from '@/context';

export function useDogs(ownedOnly: boolean = false) {
  const { user } = useAuth();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(false);

  // READ - Fetch Dogs (all or only user's dogs)
  const fetchDogs = useCallback(async () => {
    if (!user && ownedOnly) {
      setDogs([]);
      return;
    }

    setLoading(true);
    try {
      let q;
      if (ownedOnly && user) {
        // Fetch only current user's dogs
        q = query(collection(db, 'dogs'), where('ownerId', '==', user.uid));
      } else {
        // Fetch all dogs
        q = collection(db, 'dogs');
      }
      
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(docSnap => ({
        id: docSnap.id, 
        ...docSnap.data()
      })) as Dog[];
      
      setDogs(results);
    } catch (error) {
      console.error('Error fetching dogs:', error);
      setDogs([]);
    } finally {
      setLoading(false);
    }
  }, [user, ownedOnly]);

  // CREATE
  const addDog = async (dog: Omit<Dog, 'id' | 'ownerId' | 'createdAt'>) => {
    if (!user) throw new Error('Not authenticated');
    const docRef = await addDoc(collection(db, 'dogs'), {
      ...dog,
      ownerId: user.uid,
      createdAt: new Date()
    });
    await fetchDogs();
    return docRef.id;
  };

  // UPDATE
  const updateDog = async (id: string, updates: Partial<Dog>) => {
    const ref = doc(db, 'dogs', id);
    await updateDoc(ref, updates);
    await fetchDogs();
  };

  // DELETE
  const deleteDog = async (id: string) => {
    await deleteDoc(doc(db, 'dogs', id));
    await fetchDogs();
  };

  useEffect(() => {
    fetchDogs();
  }, [fetchDogs]);

  return {
    dogs, 
    loading, 
    fetchDogs, 
    addDog, 
    updateDog, 
    deleteDog
  };
}