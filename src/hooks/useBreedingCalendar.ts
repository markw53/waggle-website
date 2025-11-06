import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/context/useAuth';
import { addDays } from 'date-fns';

export function useBreedingCalendar() {
  const { user } = useAuth();
  const [upcomingCyclesCount, setUpcomingCyclesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setUpcomingCyclesCount(0);
      setLoading(false);
      return;
    }

    const fetchUpcomingCycles = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const sevenDaysFromNow = addDays(now, 7);

        const schedulesRef = collection(db, 'breedingSchedules');
        const q = query(schedulesRef, where('ownerId', '==', user.uid));
        const snapshot = await getDocs(q);

        let count = 0;
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const optimalStart = data.optimalBreedingStart?.toDate();
          
          // Count cycles where optimal window starts within next 7 days
          if (optimalStart && optimalStart >= now && optimalStart <= sevenDaysFromNow) {
            count++;
          }
        });

        setUpcomingCyclesCount(count);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error fetching upcoming cycles:', error.message);
        }
        setUpcomingCyclesCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingCycles();

    // Refresh every hour to keep the count updated
    const interval = setInterval(fetchUpcomingCycles, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  return { upcomingCyclesCount, loading };
}