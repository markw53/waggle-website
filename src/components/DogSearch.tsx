// src/components/DogSearch.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/context';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import type { Dog } from '@/types/dog';
import toast from 'react-hot-toast';
import { ROUTES, getDogProfileRoute } from '@/config/routes';

const DogSearch: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [filteredDogs, setFilteredDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'Male' | 'Female'>('all');
  const [ageFilter, setAgeFilter] = useState<'all' | 'young' | 'adult' | 'senior'>('all');

  useEffect(() => {
    const fetchDogs = async () => {
      if (!user) {
        toast.error('Please log in to browse dogs');
        navigate(ROUTES.HOME);
        return;
      }

      setLoading(true);
      try {
        let q;
        
        if (isAdmin) {
          // Admins can see all dogs
          q = query(collection(db, 'dogs'), orderBy('createdAt', 'desc'));
        } else {
          // Regular users only see approved dogs
          q = query(
            collection(db, 'dogs'),
            where('status', '==', 'approved'),
            orderBy('createdAt', 'desc')
          );
        }
        
        const snapshot = await getDocs(q);
        const dogsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Dog[];
        
        setDogs(dogsData);
        setFilteredDogs(dogsData);
      } catch (error) {
        console.error('Error fetching dogs:', error);
        toast.error('Failed to load dogs');
      } finally {
        setLoading(false);
      }
    };

    fetchDogs();
  }, [user, navigate, isAdmin]);

  // Filter dogs based on search term and filters
  useEffect(() => {
    let filtered = [...dogs];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(dog =>
        dog.name.toLowerCase().includes(term) ||
        dog.breed.toLowerCase().includes(term)
      );
    }

    // Gender filter
    if (genderFilter !== 'all') {
      filtered = filtered.filter(dog => dog.gender === genderFilter);
    }

    // Age filter
    if (ageFilter !== 'all') {
      filtered = filtered.filter(dog => {
        if (ageFilter === 'young') return dog.age >= 2 && dog.age <= 3;
        if (ageFilter === 'adult') return dog.age >= 4 && dog.age <= 7;
        if (ageFilter === 'senior') return dog.age >= 8;
        return true;
      });
    }

    setFilteredDogs(filtered);
  }, [dogs, searchTerm, genderFilter, ageFilter]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setGenderFilter('all');
    setAgeFilter('all');
  };

  const getStatusBadge = (status?: string) => {
    if (!status || status === 'approved') return null;
    
    const badges = {
      pending: { text: '⏳ Pending', class: 'bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700' },
      rejected: { text: '❌ Rejected', class: 'bg-red-100 dark:bg-red-900/40 text-red-900 dark:text-red-200 border border-red-300 dark:border-red-700' },
      suspended: { text: '🚫 Suspended', class: 'bg-gray-100 dark:bg-gray-900/40 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-700' },
    };

    const badge = badges[status as keyof typeof badges];
    return badge ? (
      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${badge.class}`}>
        {badge.text}
      </span>
    ) : null;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen" role="status">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#8c5628] dark:border-amber-500 mb-4" aria-hidden="true"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading dogs...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto my-10 p-6">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 sm:p-8 mb-8 border-2 border-zinc-200 dark:border-zinc-700 shadow-lg">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-[#573a1c] dark:text-amber-200 mb-2">
            🐕 Browse Dogs
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isAdmin ? 'Viewing all dogs (Admin Mode)' : 'Find your perfect breeding match'}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Search by name or breed
            </label>
            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search dogs..."
              className="w-full px-4 py-3 border-2 border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500 font-medium"
            />
          </div>

          {/* Filter Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Gender Filter */}
            <div>
              <label htmlFor="gender-filter" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Gender
              </label>
              <select
                id="gender-filter"
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value as 'all' | 'Male' | 'Female')}
                className="w-full px-4 py-3 border-2 border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500 font-medium"
              >
                <option value="all">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* Age Filter */}
            <div>
              <label htmlFor="age-filter" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Age Range
              </label>
              <select
                id="age-filter"
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value as 'all' | 'young' | 'adult' | 'senior')}
                className="w-full px-4 py-3 border-2 border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500 font-medium"
              >
                <option value="all">All Ages</option>
                <option value="young">Young (2-3 years)</option>
                <option value="adult">Adult (4-7 years)</option>
                <option value="senior">Senior (8+ years)</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleClearFilters}
                className="w-full px-4 py-3 bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors font-semibold"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Showing {filteredDogs.length} of {dogs.length} dogs
          </p>
        </div>
      </div>

      {/* Dogs Grid */}
      {filteredDogs.length === 0 ? (
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-12 text-center border-2 border-zinc-200 dark:border-zinc-700 shadow-lg">
          <div className="text-6xl mb-4" aria-hidden="true">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Dogs Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || genderFilter !== 'all' || ageFilter !== 'all'
              ? 'Try adjusting your filters or search term'
              : 'No dogs are currently available'}
          </p>
          {(searchTerm || genderFilter !== 'all' || ageFilter !== 'all') && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-6 py-3 bg-[#8c5628] dark:bg-amber-700 text-white rounded-lg hover:bg-[#6d4320] dark:hover:bg-amber-600 transition-colors font-semibold"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDogs.map((dog) => (
            <div
              key={dog.id}
              onClick={() => navigate(getDogProfileRoute(dog.id))}
              className="bg-white dark:bg-zinc-800 rounded-xl overflow-hidden border-2 border-zinc-200 dark:border-zinc-700 shadow-md hover:shadow-xl transition-all cursor-pointer group hover:scale-105 duration-200"
            >
              {/* Dog Image */}
              <div className="relative h-48 overflow-hidden bg-linear-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-600">
                {dog.imageUrl ? (
                  <img
                    src={dog.imageUrl}
                    alt={dog.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">
                    🐕
                  </div>
                )}
                
                {/* Admin Status Badge */}
                {isAdmin && getStatusBadge(dog.status) && (
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(dog.status)}
                  </div>
                )}
              </div>

              {/* Dog Info */}
              <div className="p-5 bg-zinc-50 dark:bg-zinc-900">
                <h3 className="text-xl font-bold text-[#573a1c] dark:text-amber-200 mb-2 truncate">
                  {dog.name}
                </h3>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300 font-medium">
                  <p className="flex items-center gap-2">
                    <span>🐾</span>
                    <span className="truncate">{dog.breed}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span>🎂</span>
                    <span>{dog.age} {dog.age === 1 ? 'year' : 'years'}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span>{dog.gender === 'Male' ? '♂️' : '♀️'}</span>
                    <span>{dog.gender}</span>
                  </p>
                </div>

                {/* Bio Preview */}
                {dog.bio && (
                  <p className="mt-3 text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                    {dog.bio}
                  </p>
                )}

                {/* View Profile Button */}
                <button
                  type="button"
                  className="w-full mt-4 px-4 py-2 bg-[#8c5628] dark:bg-amber-700 text-white rounded-lg hover:bg-[#6d4320] dark:hover:bg-amber-600 transition-colors font-semibold text-sm group-hover:bg-[#6d4320] dark:group-hover:bg-amber-600"
                >
                  View Profile →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Dog CTA */}
      {!isAdmin && filteredDogs.length > 0 && (
        <div className="mt-8 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Don't see your dog?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Register your dog to start connecting with potential breeding matches
          </p>
          <button
            type="button"
            onClick={() => navigate(ROUTES.ADD_DOG)}
            className="px-6 py-3 bg-[#8c5628] dark:bg-amber-700 text-white rounded-lg hover:bg-[#6d4320] dark:hover:bg-amber-600 transition-colors font-semibold shadow-md"
          >
            🐕 Add Your Dog
          </button>
        </div>
      )}
    </div>
  );
};

export default DogSearch;