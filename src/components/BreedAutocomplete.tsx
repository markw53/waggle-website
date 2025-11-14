// src/components/BreedAutocomplete.tsx
import { useState, useEffect, useRef } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import type { BreedInfo } from '@/types/breed';

interface Props {
  value: string;
  onChange: (breed: string) => void;
  onBreedSelect?: (breedInfo: BreedInfo | null) => void;
}

export function BreedAutocomplete({ value, onChange, onBreedSelect }: Props) {
  const [breeds, setBreeds] = useState<BreedInfo[]>([]);
  const [filteredBreeds, setFilteredBreeds] = useState<BreedInfo[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'breeds'));
        const breedData = snapshot.docs.map(doc => doc.data() as BreedInfo);
        setBreeds(breedData);
      } catch (error) {
        console.error('Error fetching breeds:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBreeds();
  }, []);

  useEffect(() => {
    if (value.length >= 2) {
      const searchTerm = value.toLowerCase();
      const filtered = breeds
        .filter(breed => 
          breed.name.toLowerCase().includes(searchTerm) ||
          breed.type.toLowerCase().includes(searchTerm) ||
          breed.searchKeywords?.some(kw => kw.includes(searchTerm))
        )
        .sort((a, b) => {
          // Prioritize exact matches
          const aStartsWith = a.name.toLowerCase().startsWith(searchTerm);
          const bStartsWith = b.name.toLowerCase().startsWith(searchTerm);
          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;
          // Then sort by popularity
          return a.popularity - b.popularity;
        })
        .slice(0, 10);
      setFilteredBreeds(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredBreeds([]);
      setShowSuggestions(false);
    }
  }, [value, breeds]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (breed: BreedInfo) => {
    onChange(breed.name);
    setShowSuggestions(false);
    onBreedSelect?.(breed);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => value.length >= 2 && setShowSuggestions(true)}
        placeholder="Start typing breed name..."
        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100"
        disabled={loading}
      />
      
      {loading && (
        <div className="absolute right-3 top-3">
          <div className="animate-spin h-4 w-4 border-2 border-amber-700 border-t-transparent rounded-full"></div>
        </div>
      )}
      
      {showSuggestions && filteredBreeds.length > 0 && (
        <ul
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {filteredBreeds.map((breed) => (
            <li
              key={breed.id}
              onClick={() => handleSelect(breed)}
              className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-zinc-600 cursor-pointer border-b border-gray-100 dark:border-zinc-600 last:border-0 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {breed.name}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {breed.type} • Popularity #{breed.popularity}
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {breed.longevity}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      
      {showSuggestions && value.length >= 2 && filteredBreeds.length === 0 && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded-md shadow-lg p-4 text-center text-gray-600 dark:text-gray-400">
          No breeds found. You can still type a custom breed name.
        </div>
      )}
    </div>
  );
}