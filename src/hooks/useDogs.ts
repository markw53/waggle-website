// src/hooks/useDogs.ts
import { useState, useEffect } from 'react';
import {
  collection, getDocs, doc, addDoc,
  updateDoc, deleteDoc, query, where
} from 'firebase/firestore';
import { db } from '../firebase';
import { Dog } from '../types/dog';
import { useAuth } from './auth';

export function useDogs() {
  const { user } = useAuth();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(false);

  // READ - Fetch All Dogs for current user (or all, for demo)
  const fetchDogs = async () => {
    setLoading(true);
    const q = query(collection(db, 'dogs'), where('ownerId', '==', user?.uid));
    const snapshot = await getDocs(q);
    const results = snapshot.docs.map(docSnap => ({
      id: docSnap.id, ...docSnap.data()
    })) as Dog[];
    setDogs(results);
    setLoading(false);
  };

  // CREATE
  const addDog = async (dog: Omit<Dog, 'id' | 'ownerId' | 'createdAt'>) => {
    if (!user) throw new Error('Not authenticated');
    const docRef = await addDoc(collection(db, 'dogs'), {
      ...dog,
      ownerId: user.uid,
      createdAt: new Date()
    });
    fetchDogs();
    return docRef.id;
  };

  // UPDATE
  const updateDog = async (id: string, updates: Partial<Dog>) => {
    const ref = doc(db, 'dogs', id);
    await updateDoc(ref, updates);
    fetchDogs();
  };

  // DELETE
  const deleteDog = async (id: string) => {
    await deleteDoc(doc(db, 'dogs', id));
    fetchDogs();
  };

  useEffect(() => {
    if (user) fetchDogs();
    else setDogs([]);
    // eslint-disable-next-line
  }, [user]);

  return {
    dogs, loading, fetchDogs, addDog, updateDog, deleteDog
  };
}