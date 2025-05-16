// src/components/DogSearch.tsx
import { useState, useMemo, useEffect } from 'react';
import { useDogs } from '../hooks/useDogs';
import DogCard from './DogCard';
import './DogSearch.css';

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

  // Optionally fetch on mount or when needed
  useEffect(() => { fetchDogs(); }, [fetchDogs]);

  const breeds = useMemo(
    () => [...new Set(dogs.map(d => d.breed).filter(Boolean))],
    [dogs]
  );

  // Composite filter
  const filtered = useMemo(() => 
    dogs.filter(dog => {
      return (
        (!search || dog.name.toLowerCase().includes(search.toLowerCase()))
        && (!breed || dog.breed === breed)
        && (!size || dog.traits.size === size)
        && (!energy || dog.traits.energy === energy)
        && (!friendliness || dog.traits.friendliness === friendliness)
        && (!gender || dog.gender === gender)
        && (!age || dog.age === Number(age))
      );
    }), [dogs, search, breed, size, energy, friendliness, gender, age]
  );

  return (
    <div className="dogsearch-box">
      <h2>Browse and Search Dogs</h2>
      <form className="dogsearch-form" onSubmit={e => e.preventDefault()}>
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <label htmlFor="breed-select" className="visually-hidden">Breed</label>
        <select
          id="breed-select"
          value={breed}
          onChange={e => setBreed(e.target.value)}
          aria-label="Breed"
        >
          <option value="">All Breeds</option>
          {breeds.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <label htmlFor="size-select" className="visually-hidden">Size</label>
        <select
          id="size-select"
          value={size}
          onChange={e => setSize(e.target.value)}
          aria-label="Size"
        >
          <option value="">Any Size</option>
          {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <label htmlFor="energy-select" className="visually-hidden">Energy</label>
        <select
          id="energy-select"
          value={energy}
          onChange={e => setEnergy(e.target.value)}
          aria-label="Energy"
        >
          <option value="">Any Energy</option>
          {ENERGIES.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <label htmlFor="friendliness-select" className="visually-hidden">Friendliness</label>
        <select
          id="friendliness-select"
          value={friendliness}
          onChange={e => setFriendliness(e.target.value)}
          aria-label="Friendliness"
        >
          <option value="">Any Friendliness</option>
          {FRIENDLINESS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <label htmlFor="gender-select" className="visually-hidden">Gender</label>
        <select
          id="gender-select"
          value={gender}
          onChange={e => setGender(e.target.value)}
          aria-label="Gender"
        >
          <option value="">Any Gender</option>
          {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <input
          type="number"
          min={1}
          max={20}
          placeholder="Age"
          value={age}
          onChange={e => setAge(e.target.value)}
        />
      </form>
      <div className="dogsearch-results">
        {loading ? (
          <div>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="dogsearch-empty">No dogs match your criteria.</div>
        ) : (
          filtered.map(dog => <DogCard key={dog.id} dog={dog} />)
        )}
      </div>
    </div>
  );
};

export default DogSearch;