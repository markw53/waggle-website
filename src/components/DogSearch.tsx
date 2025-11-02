// src/components/DogSearch.tsx
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useDogs } from '@/hooks/useDogs';
import DogCard from './DogCard';
import { debounce } from 'lodash';

const GENDERS = ['Male', 'Female'];

const DogSearch: React.FC = () => {
  const { dogs, loading, fetchDogs } = useDogs();

  const [search, setSearch] = useState('');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [initialLoad, setInitialLoad] = useState(true);

  // Fetch dogs only once on mount
  useEffect(() => {
    const loadDogs = async () => {
      await fetchDogs();
      setInitialLoad(false);
    };
    loadDogs();
  }, [fetchDogs]); // Added fetchDogs to dependencies

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
    dogs.filter(dog => {
      // Search filter
      if (debouncedSearch && !dog.name.toLowerCase().includes(debouncedSearch.toLowerCase())) {
        return false;
      }
      // Breed filter
      if (breed && dog.breed !== breed) {
        return false;
      }
      // Gender filter
      if (gender && dog.gender !== gender) {
        return false;
      }
      // Min age filter
      if (minAge && dog.age < Number(minAge)) {
        return false;
      }
      // Max age filter
      if (maxAge && dog.age > Number(maxAge)) {
        return false;
      }
      return true;
    }), 
    [dogs, debouncedSearch, breed, gender, minAge, maxAge]
  );

  const handleReset = useCallback(() => {
    setSearch('');
    setBreed('');
    setGender('');
    setMinAge('');
    setMaxAge('');
  }, []);

  // Show initial loading spinner
  if (initialLoad && loading) {
    return (
      <div className="max-w-6xl mx-auto my-10 p-6 sm:p-8 bg-white/95 dark:bg-zinc-800/95 rounded-xl shadow-xl backdrop-blur-sm border border-zinc-200 dark:border-zinc-700">
        <div className="flex flex-col items-center justify-center py-24" role="status" aria-live="polite">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#8c5628] dark:border-amber-500 mb-6" aria-hidden="true"></div>
          <h2 className="text-2xl font-bold text-[#573a1c] dark:text-amber-200 mb-2">
            Loading Dogs...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Please wait while we fetch all available dogs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto my-10 p-6 sm:p-8 bg-white/95 dark:bg-zinc-800/95 rounded-xl shadow-xl backdrop-blur-sm border border-zinc-200 dark:border-zinc-700">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#573a1c] dark:text-amber-200 mb-2">
          Browse Dogs 🐕
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Search and filter to find the perfect match
        </p>
      </div>

      {/* Search and Filters */}
      <form 
        className="mb-8 p-6 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg border border-zinc-200 dark:border-zinc-600" 
        onSubmit={e => e.preventDefault()}
        aria-label="Dog search and filter form"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Search */}
          <div>
            <label htmlFor="search-name" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Search by Name
            </label>
            <input
              id="search-name"
              type="text"
              placeholder="e.g., Max, Bella..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
          </div>

          {/* Breed */}
          <div>
            <label htmlFor="filter-breed" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Breed
            </label>
            <select
              id="filter-breed"
              value={breed}
              onChange={e => setBreed(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500"
            >
              <option value="">All Breeds</option>
              {breeds.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          {/* Gender */}
          <div>
            <label htmlFor="filter-gender" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Gender
            </label>
            <select
              id="filter-gender"
              value={gender}
              onChange={e => setGender(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500"
            >
              <option value="">Any Gender</option>
              {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {/* Min Age */}
          <div>
            <label htmlFor="filter-min-age" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Min Age (years)
            </label>
            <input
              id="filter-min-age"
              type="number"
              min="0"
              max="25"
              placeholder="0"
              value={minAge}
              onChange={e => setMinAge(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
          </div>

          {/* Max Age */}
          <div>
            <label htmlFor="filter-max-age" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Max Age (years)
            </label>
            <input
              id="filter-max-age"
              type="number"
              min="0"
              max="25"
              placeholder="25"
              value={maxAge}
              onChange={e => setMaxAge(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
          </div>

          {/* Reset Button */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleReset}
              aria-label="Clear all filters"
              className="w-full px-4 py-2 bg-gray-200 dark:bg-zinc-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-zinc-500 transition-colors font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
          <span>
            Showing <strong className="text-[#573a1c] dark:text-amber-300">{filtered.length}</strong> of <strong className="text-[#573a1c] dark:text-amber-300">{dogs.length}</strong> dogs
          </span>
        </div>
      </form>

      {/* Results */}
      <div className="min-h-[400px]">
        {filtered.length === 0 ? (
          <div className="text-center py-12" role="status">
            <div className="text-6xl mb-4" aria-hidden="true">🐕</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Dogs Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {dogs.length === 0 
                ? "There are no dogs registered yet. Be the first to add one!" 
                : "Try adjusting your filters to see more results."}
            </p>
            {dogs.length === 0 && (
              <button
                onClick={() => window.location.href = '/add-dog'}
                className="px-6 py-3 bg-[#8c5628] dark:bg-amber-700 text-white rounded-lg hover:bg-[#6d4320] dark:hover:bg-amber-600 transition-colors font-medium"
              >
                Add a Dog
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(dog => <DogCard key={dog.id} dog={dog} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default DogSearch;