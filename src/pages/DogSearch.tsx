// src/pages/DogSearch.tsx
import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/context';
import { breedMatcher } from '@/services/BreedMatcher';
import type { Dog } from '@/types/dog';
import type { BreedInfo } from '@/types/breed';
import { Link } from 'react-router-dom';
import { getDogProfileRoute, getBreedIdFromName, getBreedProfileRoute } from '@/config/routes';
import toast from 'react-hot-toast';

const DogSearch: React.FC = () => {
  const { user } = useAuth();
  
  // Dogs data
  const [allDogs, setAllDogs] = useState<Dog[]>([]);
  const [filteredDogs, setFilteredDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);

  // Breed filter states
  const [breeds, setBreeds] = useState<BreedInfo[]>([]);
  const [filterBreed, setFilterBreed] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterGender, setFilterGender] = useState<'all' | 'Male' | 'Female'>('all');
  const [filterMinAge, setFilterMinAge] = useState<number>(2);
  const [filterMaxAge, setFilterMaxAge] = useState<number>(15);
  const [filterMaxPrice, setFilterMaxPrice] = useState<number>(10000);
  const [filterMinIntelligence, setFilterMinIntelligence] = useState<number>(0);
  const [filterMaxYearlyCost, setFilterMaxYearlyCost] = useState<number>(5000);

  // Compatibility matching
  const [myDogId, setMyDogId] = useState<string>('');
  const [myDogs, setMyDogs] = useState<Dog[]>([]);
  const [showCompatibility, setShowCompatibility] = useState(false);
  const [compatibilityScores, setCompatibilityScores] = useState<Record<string, number>>({});
  const [calculatingMatches, setCalculatingMatches] = useState(false);

  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch breeds
  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'breeds'));
        const breedData = snapshot.docs.map(doc => doc.data() as BreedInfo);
        setBreeds(breedData);
      } catch (error: unknown) {
        console.error('Error fetching breeds:', error);
      }
    };
    fetchBreeds();
  }, []);

  // Fetch all dogs
  useEffect(() => {
    const fetchDogs = async () => {
      setLoading(true);
      try {
        const dogsQuery = query(
          collection(db, 'dogs'),
          where('status', '==', 'approved')
        );
        const snapshot = await getDocs(dogsQuery);
        const dogsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Dog[];

        setAllDogs(dogsData);
        setFilteredDogs(dogsData);
      } catch (error: unknown) {
        console.error('Error fetching dogs:', error);
        toast.error('Failed to load dogs');
      } finally {
        setLoading(false);
      }
    };

    fetchDogs();
  }, []);

  // Fetch user's dogs
  useEffect(() => {
    const fetchMyDogs = async () => {
      if (!user) return;

      try {
        const myDogsQuery = query(
          collection(db, 'dogs'),
          where('ownerId', '==', user.uid)
        );
        const snapshot = await getDocs(myDogsQuery);
        const dogsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Dog[];

        setMyDogs(dogsData);
      } catch (error: unknown) {
        console.error('Error fetching my dogs:', error);
      }
    };

    fetchMyDogs();
  }, [user]);

  // Apply filters
  useEffect(() => {
    let filtered = [...allDogs];

    // Gender filter
    if (filterGender !== 'all') {
      filtered = filtered.filter(dog => dog.gender === filterGender);
    }

    // Age filter
    filtered = filtered.filter(dog => 
      dog.age >= filterMinAge && dog.age <= filterMaxAge
    );

    // Breed name search
    if (filterBreed.trim()) {
      const breedTerm = filterBreed.toLowerCase();
      filtered = filtered.filter(dog =>
        dog.breed.toLowerCase().includes(breedTerm)
      );
    }

    // Search term (name or breed)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(dog =>
        dog.name.toLowerCase().includes(term) ||
        dog.breed.toLowerCase().includes(term)
      );
    }

    // Breed type filter (requires breed info lookup)
    if (filterType !== 'all') {
      filtered = filtered.filter(dog => {
        const breedInfo = breeds.find(b => 
          b.name.toLowerCase() === dog.breed.toLowerCase()
        );
        return breedInfo?.type === filterType;
      });
    }

    // Intelligence filter
    if (filterMinIntelligence > 0) {
      filtered = filtered.filter(dog => {
        const breedInfo = breeds.find(b => 
          b.name.toLowerCase() === dog.breed.toLowerCase()
        );
        return breedInfo ? breedInfo.intelligence >= filterMinIntelligence : true;
      });
    }

    // Max puppy price filter
    if (filterMaxPrice < 10000) {
      filtered = filtered.filter(dog => {
        const breedInfo = breeds.find(b => 
          b.name.toLowerCase() === dog.breed.toLowerCase()
        );
        return breedInfo ? breedInfo.avgPuppyPrice <= filterMaxPrice : true;
      });
    }

    // Max yearly cost filter
    if (filterMaxYearlyCost < 5000) {
      filtered = filtered.filter(dog => {
        const breedInfo = breeds.find(b => 
          b.name.toLowerCase() === dog.breed.toLowerCase()
        );
        return breedInfo ? breedInfo.yearlyExpenses <= filterMaxYearlyCost : true;
      });
    }

    setFilteredDogs(filtered);
  }, [allDogs, breeds, filterGender, filterMinAge, filterMaxAge, filterBreed, searchTerm, 
      filterType, filterMinIntelligence, filterMaxPrice, filterMaxYearlyCost]);

  // Calculate compatibility scores
  const calculateCompatibility = async () => {
    if (!myDogId) {
      toast.error('Please select your dog first');
      return;
    }

    const selectedDog = myDogs.find(d => d.id === myDogId);
    if (!selectedDog) {
      toast.error('Could not find selected dog');
      return;
    }

    setCalculatingMatches(true);
    setShowCompatibility(true);

    try {
      const matches = await breedMatcher.findBestMatches(
        selectedDog,
        filteredDogs,
        filteredDogs.length
      );

      const scores: Record<string, number> = {};
      matches.forEach(match => {
        scores[match.dog.id] = match.compatibilityScore;
      });

      setCompatibilityScores(scores);
      
      // Sort by compatibility
      const sorted = filteredDogs.sort((a, b) => {
        const scoreA = scores[a.id] || 0;
        const scoreB = scores[b.id] || 0;
        return scoreB - scoreA;
      });
      
      setFilteredDogs([...sorted]);
      toast.success('Compatibility scores calculated!');
    } catch (error: unknown) {
      console.error('Error calculating compatibility:', error);
      toast.error('Failed to calculate compatibility');
    } finally {
      setCalculatingMatches(false);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilterBreed('');
    setFilterType('all');
    setFilterGender('all');
    setFilterMinAge(2);
    setFilterMaxAge(15);
    setFilterMaxPrice(10000);
    setFilterMinIntelligence(0);
    setFilterMaxYearlyCost(5000);
    setSearchTerm('');
    setShowCompatibility(false);
    setMyDogId('');
  };

  // Get compatibility badge
  const getCompatibilityBadge = (score: number) => {
    if (score >= 85) return { color: 'bg-green-500', text: 'Excellent', emoji: '🌟' };
    if (score >= 70) return { color: 'bg-blue-500', text: 'Good', emoji: '✅' };
    if (score >= 55) return { color: 'bg-yellow-500', text: 'Fair', emoji: '⚠️' };
    return { color: 'bg-red-500', text: 'Poor', emoji: '❌' };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-700 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading dogs...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🔍 Find Your Perfect Match
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Search through {allDogs.length} approved dogs using advanced breed filters
        </p>
      </div>

      {/* Compatibility Matcher */}
      {myDogs.length > 0 && (
        <div className="bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg shadow-lg p-6 mb-6 border-2 border-purple-200 dark:border-purple-800">
          <h2 className="text-xl font-bold text-purple-900 dark:text-purple-200 mb-4 flex items-center gap-2">
            <span>🧬</span> Breed Compatibility Matcher
          </h2>
          <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
            Select one of your dogs to see compatibility scores with all other dogs
          </p>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label 
                htmlFor="my-dog-select"
                className="sr-only"
              >
                Select Your Dog
              </label>
              <select
                id="my-dog-select"
                value={myDogId}
                onChange={(e) => setMyDogId(e.target.value)}
                className="w-full px-4 py-2 border border-purple-300 dark:border-purple-700 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Select your dog...</option>
                {myDogs.map(dog => (
                  <option key={dog.id} value={dog.id}>
                    {dog.name} ({dog.breed}) - {dog.gender}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={calculateCompatibility}
              disabled={!myDogId || calculatingMatches}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2 md:self-end"
            >
              {calculatingMatches ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Calculating...
                </>
              ) : (
                <>
                  🧬 Calculate Matches
                </>
              )}
            </button>
          </div>
          
          {showCompatibility && (
            <div className="mt-4 p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg border border-purple-300 dark:border-purple-700">
              <p className="text-sm text-purple-900 dark:text-purple-200 flex items-center gap-2">
                <span>✨</span> Compatibility scores are now shown on each dog card below
              </p>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            🎛️ Filters
          </h2>
          <button
            onClick={resetFilters}
            className="text-sm text-amber-700 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 font-medium"
          >
            Reset All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search */}
          <div className="lg:col-span-3">
            <label htmlFor="search-dogs" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search by Name or Breed
            </label>
            <input
              id="search-dogs"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g., Max, Labrador..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Breed Type */}
          <div>
            <label 
              htmlFor="breed-type-filter"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Breed Type
            </label>
            <select
              id="breed-type-filter"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Types</option>
              <option value="Sporting">Sporting</option>
              <option value="Hound">Hound</option>
              <option value="Working">Working</option>
              <option value="Terrier">Terrier</option>
              <option value="Toy">Toy</option>
              <option value="Non-Sporting">Non-Sporting</option>
              <option value="Herding">Herding</option>
            </select>
          </div>

          {/* Gender */}
          <div>
            <label 
              htmlFor="gender-filter"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Gender
            </label>
            <select
              id="gender-filter"
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value as 'all' | 'Male' | 'Female')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          {/* Breed Name */}
          <div>
            <label htmlFor="specific-breed" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Specific Breed
            </label>
            <input
              id="specific-breed"
              type="text"
              value={filterBreed}
              onChange={(e) => setFilterBreed(e.target.value)}
              placeholder="e.g., Labrador"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Age Range */}
          <div>
            <label htmlFor="age-range-min" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Age Range: {filterMinAge} - {filterMaxAge} years
            </label>
            <div className="flex gap-2 items-center">
              <input
                id="age-range-min"
                type="range"
                min="2"
                max="15"
                value={filterMinAge}
                onChange={(e) => setFilterMinAge(Math.min(Number(e.target.value), filterMaxAge))}
                className="flex-1"
                aria-label="Minimum age"
              />
              <input
                id="age-range-max"
                type="range"
                min="2"
                max="15"
                value={filterMaxAge}
                onChange={(e) => setFilterMaxAge(Math.max(Number(e.target.value), filterMinAge))}
                className="flex-1"
                aria-label="Maximum age"
              />
            </div>
          </div>

          {/* Max Puppy Price */}
          <div>
            <label 
              htmlFor="max-puppy-price"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Max Puppy Price: ${filterMaxPrice.toLocaleString()}
            </label>
            <input
              id="max-puppy-price"
              type="range"
              min="0"
              max="10000"
              step="500"
              value={filterMaxPrice}
              onChange={(e) => setFilterMaxPrice(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Min Intelligence */}
          <div>
            <label 
              htmlFor="min-intelligence"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Min Intelligence Rank: {filterMinIntelligence || 'Any'}
            </label>
            <input
              id="min-intelligence"
              type="range"
              min="0"
              max="100"
              step="5"
              value={filterMinIntelligence}
              onChange={(e) => setFilterMinIntelligence(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Max Yearly Cost */}
          <div>
            <label 
              htmlFor="max-yearly-cost"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Max Yearly Cost: ${filterMaxYearlyCost.toLocaleString()}
            </label>
            <input
              id="max-yearly-cost"
              type="range"
              min="0"
              max="5000"
              step="250"
              value={filterMaxYearlyCost}
              onChange={(e) => setFilterMaxYearlyCost(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {filteredDogs.length} {filteredDogs.length === 1 ? 'Dog' : 'Dogs'} Found
          </h2>
          {showCompatibility && (
            <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
              <span>🧬</span> Sorted by compatibility
            </div>
          )}
        </div>

        {filteredDogs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Dogs Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your filters
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDogs.map(dog => {
              const breedInfo = breeds.find(b => 
                b.name.toLowerCase() === dog.breed.toLowerCase()
              );
              const compatScore = compatibilityScores[dog.id];
              const badge = compatScore ? getCompatibilityBadge(compatScore) : null;

              return (
                                <div
                  key={dog.id}
                  className="bg-zinc-50 dark:bg-zinc-700 rounded-lg border-2 border-zinc-200 dark:border-zinc-600 hover:border-amber-500 dark:hover:border-amber-600 transition-all hover:shadow-lg overflow-hidden"
                >
                  {/* Compatibility Badge */}
                  {badge && (
                    <div className={`${badge.color} px-4 py-2 text-white text-center font-bold text-sm`}>
                      {badge.emoji} {compatScore}% {badge.text} Match
                    </div>
                  )}

                  {/* Dog Image - Clickable */}
                  <Link to={getDogProfileRoute(dog.id)} className="block">
                    <div className="aspect-square relative">
                      {dog.imageUrl ? (
                        <img
                          src={dog.imageUrl}
                          alt={dog.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-linear-to-br from-zinc-200 to-zinc-300 dark:from-zinc-600 dark:to-zinc-700 flex items-center justify-center text-8xl">
                          🐕
                        </div>
                      )}
                      
                      {/* Gender Badge */}
                      <div className={`absolute top-3 right-3 px-3 py-1 rounded-full font-semibold text-sm ${
                        dog.gender === 'Male' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-pink-500 text-white'
                      }`}>
                        {dog.gender === 'Male' ? '♂️' : '♀️'} {dog.gender}
                      </div>
                    </div>
                  </Link>

                  {/* Dog Info */}
                  <div className="p-4">
                    <Link to={getDogProfileRoute(dog.id)}>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 hover:text-amber-700 dark:hover:text-amber-400 transition-colors">
                        {dog.name}
                      </h3>
                    </Link>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <Link 
                        to={getBreedProfileRoute(getBreedIdFromName(dog.breed))}
                        className="text-amber-700 dark:text-amber-400 hover:underline font-semibold"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {dog.breed}
                      </Link>
                      {' • '}
                      {dog.age} {dog.age === 1 ? 'year' : 'years'}
                    </p>

                    {/* Breed Info */}
                    {breedInfo && (
                      <div className="space-y-2 text-xs mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Type:</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">{breedInfo.type}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Intelligence:</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">Rank #{breedInfo.intelligence}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Avg Puppy Price:</span>
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            ${breedInfo.avgPuppyPrice.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* View Profile Button */}
                    <Link to={getDogProfileRoute(dog.id)}>
                      <button
                        type="button"
                        className="w-full px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-600 transition-colors font-semibold text-sm"
                      >
                        View Full Profile →
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DogSearch;