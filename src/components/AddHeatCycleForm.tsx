import { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/context/useAuth';
import type { Dog } from '@/types/dog';
import { addDays } from 'date-fns';
import toast from 'react-hot-toast';

interface AddHeatCycleFormProps {
  dogs: Dog[];
  onSuccess: () => void;
}

export default function AddHeatCycleForm({ dogs, onSuccess }: AddHeatCycleFormProps) {
  const { user } = useAuth();
  const [selectedDog, setSelectedDog] = useState('');
  const [startDate, setStartDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedDog || !startDate) return;

    setLoading(true);
    try {
      const cycleStart = new Date(startDate);
      const cycleEnd = addDays(cycleStart, 21); // 21-day cycle
      const optimalStart = addDays(cycleStart, 9); // Day 10
      const optimalEnd = addDays(cycleStart, 14); // Day 14

      await addDoc(collection(db, 'breedingSchedules'), {
        dogId: selectedDog,
        ownerId: user.uid,
        cycleStartDate: Timestamp.fromDate(cycleStart),
        cycleEndDate: Timestamp.fromDate(cycleEnd),
        optimalBreedingStart: Timestamp.fromDate(optimalStart),
        optimalBreedingEnd: Timestamp.fromDate(optimalEnd),
        notes,
        createdAt: Timestamp.now(),
      });

      toast.success('Heat cycle added successfully!');
      setSelectedDog('');
      setStartDate('');
      setNotes('');
      onSuccess();
    } catch (error) {
      console.error('Error adding cycle:', error);
      toast.error('Failed to add heat cycle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Add Heat Cycle
      </h3>

      <div>
        <label
            htmlFor="select-dog"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Select Dog
        </label>
        <select
          id="select-dog"
          value={selectedDog}
          onChange={(e) => setSelectedDog(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">Choose a dog...</option>
          {dogs.filter(d => d.gender === 'Female').map(dog => (
            <option key={dog.id} value={dog.id}>
              {dog.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label 
            htmlFor="start-date"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Heat Cycle Start Date
        </label>
        <input
          id="start-date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100"
          placeholder="Any additional notes..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-amber-700 hover:bg-amber-600 text-white py-2 rounded-md font-semibold disabled:opacity-50"
      >
        {loading ? 'Adding...' : 'Add Heat Cycle'}
      </button>
    </form>
  );
}