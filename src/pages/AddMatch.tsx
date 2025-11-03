import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase';
import toast from 'react-hot-toast';
import { ROUTES } from '@/config/routes';

interface DogProfile {
  id: string;
  name: string;
  breed: string;
  ownerId: string;
}

const AddMatch: React.FC = () => {
  const [dogs, setDogs] = useState<DogProfile[]>([]);
  const [dog1, setDog1] = useState<string>('');
  const [dog2, setDog2] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetchingDogs, setFetchingDogs] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDogs = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          toast.error('You must be logged in.');
          navigate(ROUTES.HOME);
          return;
        }
        const dogQuery = query(collection(db, 'dogs'), where('ownerId', '==', user.uid));
        const snapshot = await getDocs(dogQuery);
        const dogList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DogProfile));
        setDogs(dogList);
        
        if (dogList.length === 0) {
          toast.error('You need to add dogs first!');
        }
      } catch (error) {
        console.error('Error fetching dogs:', error);
        toast.error('Failed to load your dogs.');
      } finally {
        setFetchingDogs(false);
      }
    };
    fetchDogs();
  }, [navigate]);

  const availableDog2 = dogs.filter(d => d.id !== dog1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dog1 || !dog2 || !date || !location.trim()) {
      toast.error('Please fill in all fields.');
      return;
    }
    
    if (dog1 === dog2) {
      toast.error('Please select two different dogs.');
      return;
    }

    setLoading(true);
    
    try {
      await addDoc(collection(db, 'matches'), {
        dog1,
        dog2,
        date,
        location: location.trim(),
        createdBy: auth.currentUser?.uid,
        createdAt: new Date(),
      });
      toast.success('Match added successfully! 💕');
      navigate(ROUTES.MATCHES);
    } catch (error) {
      console.error('Error adding match:', error);
      toast.error('Could not add match. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingDogs) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8c5628] dark:border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dogs...</p>
        </div>
      </div>
    );
  }

  if (dogs.length < 2) {
    return (
      <div className="max-w-md mx-auto mt-10 p-8 bg-white/95 dark:bg-zinc-800/95 rounded-xl shadow-lg backdrop-blur-sm border border-zinc-200 dark:border-zinc-700">
        <div className="text-center">
          <div className="text-6xl mb-4">🐕</div>
          <h2 className="text-2xl font-bold text-[#573a1c] dark:text-amber-200 mb-2">
            Not Enough Dogs
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need at least 2 dogs to create a match. Please add more dogs first.
          </p>
          <button
            onClick={() => navigate(ROUTES.ADD_DOG)}
            className="px-6 py-3 rounded-lg font-semibold text-white bg-[#8c5628] dark:bg-amber-700 hover:bg-[#6d4320] dark:hover:bg-amber-600 transition-colors"
          >
            Add a Dog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 mb-10 p-6 sm:p-8 bg-white/95 dark:bg-zinc-800/95 rounded-xl shadow-xl backdrop-blur-sm border border-zinc-200 dark:border-zinc-700">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#573a1c] dark:text-amber-200 mb-2">
          Create a Match 💕
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Schedule a breeding match between two of your dogs
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dog 1 */}
        <FormField label="First Dog" required>
          <select
            id="dog1"
            title="First Dog"
            value={dog1}
            onChange={e => setDog1(e.target.value)}
            required
            className="w-full border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500 transition-colors"
          >
            <option value="">Select first dog</option>
            {dogs.map(dog => (
              <option key={dog.id} value={dog.id}>
                {dog.name} ({dog.breed})
              </option>
            ))}
          </select>
        </FormField>

        {/* Dog 2 */}
        <FormField label="Second Dog" required>
          <label htmlFor="dog2" className="sr-only">
            Second Dog
          </label>
          <select
            id="dog2"
            aria-label="Second Dog"
            value={dog2}
            onChange={e => setDog2(e.target.value)}
            required
            disabled={!dog1}
            className="w-full border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Select second dog</option>
            {availableDog2.map(dog => (
              <option key={dog.id} value={dog.id}>
                {dog.name} ({dog.breed})
              </option>
            ))}
          </select>
          {!dog1 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Please select the first dog first
            </p>
          )}
        </FormField>

        {/* Date */}
        <FormField label="Match Date" required>
          <input
            type="date"
            id="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required
            placeholder="Select match date"
            title="Match Date"
            className="w-full border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500 transition-colors"
          />
        </FormField>

        {/* Location */}
        <FormField label="Location" required>
          <input
            type="text"
            id="location"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="e.g., City Park, Veterinary Clinic"
            maxLength={100}
            required
            className="w-full border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500 placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-colors"
          />
        </FormField>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(ROUTES.MATCHES)}
            className="flex-1 px-6 py-3 rounded-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 rounded-lg font-semibold text-white bg-[#8c5628] dark:bg-amber-700 hover:bg-[#6d4320] dark:hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating...
              </span>
            ) : (
              'Create Match'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Reusable Form Field Component
interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ label, required, children }) => (
  <div>
    <label className="block font-semibold text-gray-900 dark:text-gray-100 mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

export default AddMatch;