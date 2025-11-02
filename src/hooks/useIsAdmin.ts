// src/hooks/useIsAdmin.ts
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/context';

export function useIsAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Check in admins collection first
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        if (adminDoc.exists() && adminDoc.data()?.role === 'admin') {
          setIsAdmin(true);
          setLoading(false);
          return;
        }

        // Fallback: check users collection for isAdmin field
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data()?.isAdmin === true) {
          setIsAdmin(true);
          setLoading(false);
          return;
        }

        setIsAdmin(false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [user]);

  return { isAdmin, loading };
}