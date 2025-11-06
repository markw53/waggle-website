import { useState, useEffect } from 'react';
import BreedingCalendar from '@/components/BreedingCalendar';
import AddHeatCycleForm from '@/components/AddHeatCycleForm';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/context/useAuth';
import type { Dog } from '@/types/dog';

export default function BreedingCalendarPage() {
  const { user } = useAuth();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchDogs = async () => {
        const dogsRef = collection(db, 'dogs');
        const q = query(dogsRef, where('ownerId', '==', user.uid));
        const snapshot = await getDocs(q);
        
        const dogsList: Dog[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        } as Dog));
        
        setDogs(dogsList);
    };

    fetchDogs();
    }, [user]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Breeding Schedule Calendar
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <AddHeatCycleForm
            dogs={dogs}
            onSuccess={() => setRefreshKey(prev => prev + 1)}
          />
        </div>

        <div className="lg:col-span-2">
          <BreedingCalendar key={refreshKey} />
        </div>
      </div>
    </div>
  );
}