// src/components/DogSearch.tsx
import { useState, useMemo, useEffect } from 'react';
import { useDogs } from '../hooks/useDogs';
import DogCard from './DogCard';
import { debounce } from 'lodash';

const SIZES = ['small', 'medium', 'large'];
const ENERGIES = ['low', 'medium', 'high'];
const FRIENDLINESS = ['low', 'medium', 'high'];
const GENDERS = ['male', 'female'];

const DogSearch: React.FC = () => {
  const { dogs, loading, fetchDogs } = useDogs();

  const [search, setSearch] = useState('');
  const [breed, setBreed] = useState('');
  const [size, setSize] = useState('');
  const [energy, setEnergy] = useState('');
  const [friendliness, setFriendliness] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');

  useEffect(() => { fetchDogs(); }, [fetchDogs]);

  const breeds = useMemo(() => {
    return [...new Set(dogs.map(d => d.breed).filter(Boolean))].sort();
  }, [dogs]);

  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const debounced = debounce((val: string) => setDebouncedSearch(val), 300);
    debounced(search);
    return () => debounced.cancel();
  }, [search]);

  const filtered = useMemo(() => 
    dogs.filter(dog => (
      (!debouncedSearch || dog.name.toLowerCase().includes(debouncedSearch.toLowerCase())) &&
      (!breed || dog.breed === breed) &&
      (!size || dog.traits.size === size) &&
      (!energy || dog.traits.energy === energy) &&
      (!friendliness || dog.traits.friendliness === friendliness) &&
      (!gender || dog.gender === gender) &&
      (!age || dog.age === Number(age))
    )), [dogs, debouncedSearch, breed, size, energy, friendliness, gender, age]
  );

  return (
    <div className="bg-orange-50 max-w-2xl mx-auto my-10 p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Browse and Search Dogs</h2>

      <form className="flex flex-wrap justify-center gap-4 mb-6" onSubmit={e => e.preventDefault()}>
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="min-w-[140px] px-3 py-2 border border-orange-300 rounded-md"
        />
        <select
          value={breed}
          onChange={e => setBreed(e.target.value)}
          className="min-w-[140px] px-3 py-2 border border-orange-300 rounded-md"
        >
          <option value="">All Breeds</option>
          {breeds.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <select
          value={size}
          onChange={e => setSize(e.target.value)}
          className="min-w-[120px] px-3 py-2 border border-orange-300 rounded-md"
        >
          <option value="">Any Size</option>
          {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={energy}
          onChange={e => setEnergy(e.target.value)}
          className="min-w-[120px] px-3 py-2 border border-orange-300 rounded-md"
        >
          <option value="">Any Energy</option>
          {ENERGIES.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <select
          value={friendliness}
          onChange={e => setFriendliness(e.target.value)}
          className="min-w-[120px] px-3 py-2 border border-orange-300 rounded-md"
        >
          <option value="">Any Friendliness</option>
          {FRIENDLINESS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <select
          value={gender}
          onChange={e => setGender(e.target.value)}
          className="min-w-[120px] px-3 py-2 border border-orange-300 rounded-md"
        >
          <option value="">Any Gender</option>
          {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <div className="w-full max-w-xs flex flex-col items-center">
          <input
            type="range"
            min={1}
            max={20}
            value={age}
            onChange={e => setAge(e.target.value)}
            className="w-full"
          />
          {age && <div className="text-sm text-gray-700 mt-1">Age: {age}</div>}
        </div>
      </form>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-orange-700 font-medium">No dogs match your criteria.</div>
        ) : (
          filtered.map(dog => <DogCard key={dog.id} dog={dog} />)
        )}
      </div>
    </div>
  );
};

export default DogSearch;
