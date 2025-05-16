import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase'; // Make sure your firebase export exists
import toast from 'react-hot-toast';
import './AddMatch.css';

interface DogProfile {
  id: string;
  name: string;
  breed: string;
  ownerId: string;
  // Add additional fields if necessary
}

const AddMatch: React.FC = () => {
  const [dogs, setDogs] = useState<DogProfile[]>([]);
  const [dog1, setDog1] = useState<string>('');
  const [dog2, setDog2] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch dogs owned by current user
    const fetchDogs = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const dogQuery = query(
          collection(db, 'dogs'),
          where('ownerId', '==', user.uid)
        );
        const snapshot = await getDocs(dogQuery);
        const dogList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DogProfile));
        setDogs(dogList);
      } catch {
        toast.error('Failed to load your dogs.');
      }
    };
    fetchDogs();
  }, []);

  // Prevent duplicating dog selection
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
      navigate('/'); // Go back to dashboard or match list
    } catch {
      toast.error('Could not add match.');
    }
  };

  return (
    <div className="add-match-container">
      <h2>Add a Match</h2>
      <form className="add-match-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="dog1">Dog 1</label>
          <select id="dog1" value={dog1} onChange={e => setDog1(e.target.value)} required>
            <option value="">Select dog</option>
            {dogs.map(dog => (
              <option key={dog.id} value={dog.id}>{dog.name} ({dog.breed})</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="dog2">Dog 2</label>
          <select id="dog2" value={dog2} onChange={e => setDog2(e.target.value)} required>
            <option value="">Select dog</option>
            {availableDog2.map(dog => (
              <option key={dog.id} value={dog.id}>{dog.name} ({dog.breed})</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="date">Date</label>
          <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="location">Location</label>
          <input type="text" id="location" value={location} onChange={e => setLocation(e.target.value)} required />
        </div>
        <button type="submit" className="add-match-submit">Add Match</button>
      </form>
    </div>
  );
};

export default AddMatch;