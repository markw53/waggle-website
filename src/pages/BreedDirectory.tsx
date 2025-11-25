// src/pages/BreedDirectory.tsx
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { Link } from 'react-router-dom';
import type { BreedInfo } from '@/types/breed';
import { getBreedProfileRoute, getBreedIdFromName } from '@/config/routes';
import toast from 'react-hot-toast';

const BreedDirectory: React.FC = () => {
  const [breeds, setBreeds] = useState<BreedInfo[]>([]);
  const [filteredBreeds, setFilteredBreeds] = useState<BreedInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'type'>('name');

  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'breeds'));
        const breedData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as BreedInfo[];
        setBreeds(breedData);
        setFilteredBreeds(breedData);
      } catch (error: unknown) {
        console.error('Error fetching breeds:', error);
        toast.error('Failed to load breeds');
      } finally {
        setLoading(false);
      }
    };

    fetchBreeds();
  }, []);

  useEffect(() => {
    let filtered = [...breeds];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(breed =>
        breed.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        breed.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        breed.kennelClubCategory?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(breed => breed.type === filterType);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

    setFilteredBreeds(filtered);
  }, [breeds, searchTerm, filterType, sortBy]);

  // Get type statistics
  const typeStats = breeds.reduce((acc, breed) => {
    acc[breed.type] = (acc[breed.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-700 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading breeds...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header - IMPROVED BACKGROUND */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8 mb-6 border-2 border-amber-300 dark:border-amber-700">
        <div className="bg-linear-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-6 border-2 border-amber-200 dark:border-amber-800">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-3">
            <span>🐕</span> Dog Breed Encyclopedia
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
            Explore comprehensive information about {breeds.length} dog breeds
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(typeStats)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 4)
              .map(([type, count]) => (
                <span
                  key={type}
                  className="px-3 py-1 bg-white dark:bg-zinc-700 rounded-full text-sm font-medium text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-zinc-600 shadow-sm"
                >
                  {count} {type}
                </span>
              ))}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="breed-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Breeds
            </label>
            <input
              id="breed-search"
              type="text"
              placeholder="e.g., Labrador, Sporting..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <div>
            <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Breed Group
            </label>
            <select
              id="type-filter"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="all">All Groups ({breeds.length})</option>
              {Object.entries(typeStats)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([type, count]) => (
                  <option key={type} value={type}>
                    {type} ({count})
                  </option>
                ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort By
            </label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="name">Name (A-Z)</option>
              <option value="type">Breed Group</option>
            </select>
          </div>
        </div>

        {/* Active Filters */}
        {(searchTerm || filterType !== 'all') && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
            {searchTerm && (
              <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 rounded-full text-sm font-medium flex items-center gap-2 border border-amber-300 dark:border-amber-700">
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="hover:text-amber-900 dark:hover:text-amber-100 font-bold"
                >
                  ×
                </button>
              </span>
            )}
            {filterType !== 'all' && (
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-200 rounded-full text-sm font-medium flex items-center gap-2 border border-blue-300 dark:border-blue-700">
                Group: {filterType}
                <button
                  onClick={() => setFilterType('all')}
                  className="hover:text-blue-900 dark:hover:text-blue-100 font-bold"
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
              }}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 underline font-medium"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-4 text-gray-600 dark:text-gray-400 font-medium">
        Showing {filteredBreeds.length} of {breeds.length} breeds
      </div>

      {/* Breed Grid */}
      {filteredBreeds.length === 0 ? (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Breeds Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try adjusting your search or filters
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterType('all');
            }}
            className="px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-600 transition-colors font-semibold"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBreeds.map(breed => {
              const breedId = getBreedIdFromName(breed.name);
              
              return (
                <Link
                  key={breedId}
                  to={getBreedProfileRoute(breedId)}
                  className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg hover:shadow-2xl transition-all border-2 border-transparent hover:border-amber-500 dark:hover:border-amber-600 overflow-hidden group"
                >
                  {/* Breed Image/Header */}
                  <div className="bg-linear-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 p-6 text-center h-48 flex items-center justify-center">
                    {breed.imageUrl ? (
                      <img 
                        src={breed.imageUrl} 
                        alt={breed.name}
                        className="h-32 w-32 object-cover rounded-full border-4 border-amber-500 shadow-lg group-hover:scale-110 transition-transform"
                        onError={(e) => {
                          const img = e.currentTarget;
                          img.style.display = 'none';
                          const fallback = img.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <div 
                      className="text-6xl group-hover:scale-110 transition-transform" 
                      style={{ display: breed.imageUrl ? 'none' : 'block' }}
                    >
                      🐕
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 text-center">
                      {breed.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
                      {breed.kennelClubCategory || breed.type}
                    </p>

                    {/* Stats */}
                    <div className="space-y-2 text-sm">
                      {breed.size && (
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-zinc-700/50 rounded px-2 py-1">
                          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <span>📏</span> Size
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white text-xs">
                            {breed.size}
                          </span>
                        </div>
                      )}
                      {breed.exerciseNeeds && (
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-zinc-700/50 rounded px-2 py-1">
                          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <span>🏃</span> Exercise
                          </span>
                          <span className="font-semibold text-blue-600 dark:text-blue-400 text-xs">
                            {breed.exerciseNeeds}
                          </span>
                        </div>
                      )}
                      {breed.grooming && (
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-zinc-700/50 rounded px-2 py-1">
                          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <span>✂️</span> Grooming
                          </span>
                          <span className="font-semibold text-purple-600 dark:text-purple-400 text-xs">
                            {breed.grooming}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between bg-gray-50 dark:bg-zinc-700/50 rounded px-2 py-1">
                        <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <span>⏳</span> Lifespan
                        </span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {breed.longevity}
                        </span>
                      </div>
                    </div>

                    {/* View Button */}
                    <button
                      type="button"
                      className="w-full mt-4 px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-600 transition-colors font-semibold text-sm group-hover:bg-amber-600"
                    >
                      View Details →
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Attribution */}
          <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800 rounded-lg p-4">
            <p>
              Breed images and information courtesy of{' '}
              <a 
                href="https://www.royalkennelclub.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-amber-700 dark:text-amber-400 hover:underline font-medium"
              >
                The Kennel Club
              </a>
              {' '}• Educational use only
            </p>
          </div>
        </>
      )}

      {/* Info Section - IMPROVED BACKGROUND */}
      <div className="mt-12 bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8 border-2 border-blue-300 dark:border-blue-700">
        <div className="bg-linear-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-6 border-2 border-blue-200 dark:border-blue-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>📚</span> About Our Breed Database
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Comprehensive Data</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Each breed profile includes detailed information about physical characteristics, 
                temperament, exercise needs, grooming requirements, and health considerations.
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Royal Kennel Club Verified</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Our database uses official information from The Royal Kennel Club, 
                ensuring accuracy and reliability for breeders and dog enthusiasts.
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Breeder Resources</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Use this information to make informed decisions about breeding, 
                including compatibility matching and understanding breed characteristics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreedDirectory;