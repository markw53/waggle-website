import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase';
import toast from 'react-hot-toast';

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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDogs = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const dogQuery = query(collection(db, 'dogs'), where('ownerId', '==', user.uid));
        const snapshot = await getDocs(dogQuery);
        const dogList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DogProfile));
        setDogs(dogList);
      } catch {
        toast.error('Failed to load your dogs.');
      }
    };
    fetchDogs();
  }, []);

  const availableDog2 = dogs.filter(d => d.id !== dog1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dog1 || !dog2 || !date || !location) {
      toast.error('All fields are required.');
      return;
    }
    if (dog1 === dog2) {
      toast.error('Please select two different dogs.');
      return;
    }
    try {
      await addDoc(collection(db, 'matches'), {
        dog1,
        dog2,
        date,
        location,
        createdBy: auth.currentUser?.uid,
        createdAt: new Date(),
      });
      toast.success('Match added successfully!');
      navigate('/');
    } catch {
      toast.error('Could not add match.');
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg max-w-md mx-auto mt-10 shadow-md font-sans">
      <h2 className="mb-6 text-center font-semibold text-2xl text-[#194d33]">Add a Match</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label htmlFor="dog1" className="block text-base font-medium text-gray-800 mb-1">
            Dog 1
          </label>
          <select
            id="dog1"
            value={dog1}
            onChange={e => setDog1(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md text-base focus:outline-none focus:border-[#69b087]"
          >
            <option value="">Select dog</option>
            {dogs.map(dog => (
              <option key={dog.id} value={dog.id}>
                {dog.name} ({dog.breed})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="dog2" className="block text-base font-medium text-gray-800 mb-1">
            Dog 2
          </label>
          <select
            id="dog2"
            value={dog2}
            onChange={e => setDog2(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md text-base focus:outline-none focus:border-[#69b087]"
          >
            <option value="">Select dog</option>
            {availableDog2.map(dog => (
              <option key={dog.id} value={dog.id}>
                {dog.name} ({dog.breed})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="date" className="block text-base font-medium text-gray-800 mb-1">
            Date
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md text-base focus:outline-none focus:border-[#69b087]"
          />
        </div>
        <div>
          <label htmlFor="location" className="block text-base font-medium text-gray-800 mb-1">
            Location
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={e => setLocation(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md text-base focus:outline-none focus:border-[#69b087]"
          />
        </div>
        <button
          type="submit"
          className="mt-2 bg-gradient-to-r from-[#43cea2] to-[#185a9d] text-white font-semibold text-lg py-2 rounded-md hover:from-[#185a9d] hover:to-[#43cea2] transition-colors"
        >
          Add Match
        </button>
      </form>
    </div>
  );
};

export default AddMatch;
