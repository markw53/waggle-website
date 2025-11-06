import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enGB } from 'date-fns/locale/en-GB'; // ✅ Import en-GB locale
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/context/useAuth';
import type { Dog } from '@/types/dog'; // ✅ Import Dog type
import type { BreedingSchedule, CalendarEvent } from '@/types/breeding';
import toast from 'react-hot-toast';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-GB': enGB, // ✅ Use en-GB
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function BreedingCalendar() {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDog, setSelectedDog] = useState<string>('all');
  const [dogs, setDogs] = useState<Dog[]>([]); // ✅ Fixed type

  // Fetch user's dogs
  useEffect(() => {
    if (!user) return;

    const fetchDogs = async () => {
      const dogsRef = collection(db, 'dogs');
      const q = query(dogsRef, where('ownerId', '==', user.uid));
      const snapshot = await getDocs(q);
      const dogsList: Dog[] = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Dog));
      setDogs(dogsList);
    };

    fetchDogs();
  }, [user]);

  // Fetch breeding schedules
  useEffect(() => {
    if (!user) return;

    const fetchSchedules = async () => {
      setLoading(true);
      try {
        const schedulesRef = collection(db, 'breedingSchedules');
        const q = query(schedulesRef, where('ownerId', '==', user.uid));
        const snapshot = await getDocs(q);

        const calendarEvents: CalendarEvent[] = [];

        snapshot.docs.forEach(doc => {
          const schedule = { id: doc.id, ...doc.data() } as BreedingSchedule;

          // Filter by selected dog if not "all"
          if (selectedDog !== 'all' && schedule.dogId !== selectedDog) {
            return;
          }

          // Heat cycle event (full 21 days)
          calendarEvents.push({
            id: `cycle-${schedule.id}`,
            title: '🔴 Heat Cycle',
            start: schedule.cycleStartDate.toDate(),
            end: schedule.cycleEndDate.toDate(),
            resource: schedule,
            type: 'heat-cycle',
          });

          // Optimal breeding window (days 10-14)
          calendarEvents.push({
            id: `optimal-${schedule.id}`,
            title: '✅ Optimal Breeding Window',
            start: schedule.optimalBreedingStart.toDate(),
            end: schedule.optimalBreedingEnd.toDate(),
            resource: schedule,
            type: 'optimal-window',
          });
        });

        setEvents(calendarEvents);
      } catch (error: unknown) { // ✅ Typed catch
        if (error instanceof Error) {
          console.error('Error fetching schedules:', error.message);
        }
        toast.error('Failed to load breeding schedules');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [user, selectedDog]);

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3174ad';
    if (event.type === 'heat-cycle') {
      backgroundColor = '#ef4444'; // red
    } else if (event.type === 'optimal-window') {
      backgroundColor = '#10b981'; // green
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  if (loading) {
    return <div className="text-center py-8">Loading calendar...</div>;
  }

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Breeding Calendar
        </h2>

        <select
          aria-label="Filter calendar by dog"
          value={selectedDog}
          onChange={(e) => setSelectedDog(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100"
        >
          <option value="all">All Dogs</option>
          {dogs.map(dog => (
            <option key={dog.id} value={dog.id}>
              {dog.name}
            </option>
          ))}
        </select>
      </div>

      <div className="h-[600px]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          eventPropGetter={eventStyleGetter}
          views={['month', 'week', 'day']}
          defaultView="month"
          culture="en-GB" // ✅ Set culture to en-GB
        />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-gray-700 dark:text-gray-300">Heat Cycle (21 days)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-gray-700 dark:text-gray-300">Optimal Breeding Window (Days 10-14)</span>
        </div>
      </div>
    </div>
  );
}