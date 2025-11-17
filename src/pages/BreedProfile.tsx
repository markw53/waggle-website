// src/pages/BreedProfile.tsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import type { BreedInfo } from '@/types/breed';
import type { Dog } from '@/types/dog';
import { getDogProfileRoute, getBreedProfileRoute, getBreedIdFromName, ROUTES } from '@/config/routes';
import toast from 'react-hot-toast';

const BreedProfile: React.FC = () => {
  const { breedId } = useParams<{ breedId: string }>();
  const navigate = useNavigate();
  
  const [breed, setBreed] = useState<BreedInfo | null>(null);
  const [dogsOfBreed, setDogsOfBreed] = useState<Dog[]>([]);
  const [relatedBreeds, setRelatedBreeds] = useState<BreedInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'characteristics' | 'health' | 'costs' | 'dogs'>('overview');

  useEffect(() => {
    const fetchBreedData = async () => {
      if (!breedId) return;
      
      setLoading(true);
      try {
        const breedDoc = await getDoc(doc(db, 'breeds', breedId));
        
        if (!breedDoc.exists()) {
          toast.error('Breed not found');
          navigate(ROUTES.BREEDS);
          return;
        }

        const breedData = { id: breedDoc.id, ...breedDoc.data() } as BreedInfo;
        setBreed(breedData);
        
        // Fetch dogs of this breed
        const dogsQuery = query(
          collection(db, 'dogs'),
          where('breed', '==', breedData.name),
          where('status', '==', 'approved')
        );
        const dogsSnapshot = await getDocs(dogsQuery);
        const dogs = dogsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Dog[];
        setDogsOfBreed(dogs);

        // Fetch related breeds (same type)
        const relatedQuery = query(
          collection(db, 'breeds'),
          where('type', '==', breedData.type)
        );
        const relatedSnapshot = await getDocs(relatedQuery);
        const related = relatedSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as BreedInfo))
          .filter(b => b.name !== breedData.name)
          .slice(0, 6);
        setRelatedBreeds(related);

      } catch (error: unknown) {
        console.error('Error fetching breed:', error);
        toast.error('Failed to load breed information');
      } finally {
        setLoading(false);
      }
    };

    fetchBreedData();
  }, [breedId, navigate]);

  const getIntelligenceCategory = (rank: number): { text: string; color: string } => {
    if (rank <= 10) return { text: 'Exceptional', color: 'text-green-600' };
    if (rank <= 30) return { text: 'Excellent', color: 'text-blue-600' };
    if (rank <= 50) return { text: 'Above Average', color: 'text-yellow-600' };
    if (rank <= 70) return { text: 'Average', color: 'text-orange-600' };
    return { text: 'Fair', color: 'text-red-600' };
  };

  const getCostCategory = (cost: number): { text: string; color: string } => {
    if (cost < 1000) return { text: 'Low', color: 'text-green-600' };
    if (cost < 2000) return { text: 'Moderate', color: 'text-blue-600' };
    if (cost < 3000) return { text: 'Above Average', color: 'text-yellow-600' };
    return { text: 'High', color: 'text-red-600' };
  };

  const getPriceCategory = (price: number): { text: string; color: string } => {
    if (price < 500) return { text: 'Budget', color: 'text-green-600' };
    if (price < 1500) return { text: 'Moderate', color: 'text-blue-600' };
    if (price < 3000) return { text: 'Premium', color: 'text-yellow-600' };
    return { text: 'Luxury', color: 'text-purple-600' };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-700 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading breed information...</p>
      </div>
    );
  }

  if (!breed) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Breed Not Found</h1>
          <Link to={ROUTES.BREEDS} className="text-amber-700 dark:text-amber-400 hover:underline">
            Browse All Breeds →
          </Link>
        </div>
      </div>
    );
  }

  const intelligenceInfo = getIntelligenceCategory(breed.intelligence);
  const costInfo = getCostCategory(breed.yearlyExpenses);
  const priceInfo = getPriceCategory(breed.avgPuppyPrice);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <ol className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <li>
            <Link to="/" className="hover:text-amber-700 dark:hover:text-amber-400">Home</Link>
          </li>
          <li>/</li>
          <li>
            <Link to={ROUTES.BREEDS} className="hover:text-amber-700 dark:hover:text-amber-400">Breeds</Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 dark:text-white font-medium">{breed.name}</li>
        </ol>
      </nav>

      {/* Header with Kennel Club Image */}
      <div className="bg-linear-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg shadow-lg p-8 mb-6 border-2 border-amber-200 dark:border-amber-800">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Breed Image from Kennel Club */}
          {breed.imageUrl ? (
            <img 
              src={breed.imageUrl} 
              alt={breed.name}
              className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-full border-4 border-amber-500 shadow-xl"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'block';
              }}
            />
          ) : null}
          <div className="text-8xl" style={{ display: breed.imageUrl ? 'none' : 'block' }}>🐕</div>
          
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
              {breed.name}
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-2">
              {breed.kennelClubCategory || breed.type} Group
            </p>
            {breed.size && (
              <p className="text-md text-gray-600 dark:text-gray-400 mb-4">
                Size: {breed.size}
              </p>
            )}
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-white dark:bg-zinc-800 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-zinc-600">
                Rank #{breed.popularity} Popularity
              </span>
              <span className={`px-3 py-1 bg-white dark:bg-zinc-800 rounded-full text-sm font-medium ${intelligenceInfo.color} border border-gray-300 dark:border-zinc-600`}>
                {intelligenceInfo.text} Intelligence
              </span>
              <span className="px-3 py-1 bg-white dark:bg-zinc-800 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-zinc-600">
                {dogsOfBreed.length} Available
              </span>
            </div>
            
            {/* Official Kennel Club Link */}
            {breed.officialLink && (
              <a 
                href={breed.officialLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400 hover:underline font-medium"
              >
                <span>📖</span> View Official Kennel Club Page
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
          
          <div className="flex flex-col gap-2">
            <button
              onClick={() => navigate(ROUTES.DOGS + `?breed=${breed.name}`)}
              className="px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-600 transition-colors font-semibold shadow-lg"
            >
              Find {breed.name}s
            </button>
            <Link
              to={ROUTES.BREEDS}
              className="px-6 py-3 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors font-semibold text-center border-2 border-gray-300 dark:border-zinc-600"
            >
              All Breeds
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 text-center border-2 border-transparent hover:border-amber-500 transition-colors">
          <div className="text-3xl mb-2">🧠</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Intelligence</div>
          <div className={`text-2xl font-bold ${intelligenceInfo.color}`}>
            #{breed.intelligence}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {intelligenceInfo.text}
          </div>
        </div>
        
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 text-center border-2 border-transparent hover:border-green-500 transition-colors">
          <div className="text-3xl mb-2">💰</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Puppy Price</div>
          <div className={`text-2xl font-bold ${priceInfo.color}`}>
            £{breed.avgPuppyPrice.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {priceInfo.text}
          </div>
        </div>
        
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 text-center border-2 border-transparent hover:border-blue-500 transition-colors">
          <div className="text-3xl mb-2">📅</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Yearly Cost</div>
          <div className={`text-2xl font-bold ${costInfo.color}`}>
            £{breed.yearlyExpenses.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {costInfo.text}
          </div>
        </div>
        
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 text-center border-2 border-transparent hover:border-purple-500 transition-colors">
          <div className="text-3xl mb-2">⏳</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Lifespan</div>
          <div className="text-2xl font-bold text-purple-600">
            {breed.longevity}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Years
          </div>
        </div>
      </div>

      {/* Kennel Club Specific Info */}
      {(breed.temperament || breed.exerciseNeeds || breed.grooming || breed.goodWithChildren) && (
        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg shadow-lg p-6 mb-6 border-2 border-blue-200 dark:border-blue-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>🏆</span> Kennel Club Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {breed.temperament && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Temperament</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{breed.temperament}</p>
              </div>
            )}
            {breed.exerciseNeeds && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Exercise Needs</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{breed.exerciseNeeds}</p>
              </div>
            )}
            {breed.grooming && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Grooming</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{breed.grooming}</p>
              </div>
            )}
            {breed.goodWithChildren && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Good with Children</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{breed.goodWithChildren}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg mb-6 overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-zinc-700 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: '📋' },
            { id: 'characteristics', label: 'Characteristics', icon: '📏' },
            { id: 'health', label: 'Health', icon: '🏥' },
            { id: 'costs', label: 'Costs', icon: '💵' },
            { id: 'dogs', label: `Available (${dogsOfBreed.length})`, icon: '🐕' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-b-2 border-amber-700 dark:border-amber-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  About the {breed.name}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">🏆</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Breed Group</h3>
                        <p className="text-gray-600 dark:text-gray-400">{breed.kennelClubCategory || breed.type}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">📊</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Popularity Rank</h3>
                        <p className="text-gray-600 dark:text-gray-400">#{breed.popularity} out of all breeds</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">🧠</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Intelligence</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Rank #{breed.intelligence} - {intelligenceInfo.text}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">🍽️</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Feeding</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {breed.mealsPerDay} meals per day recommended
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">⏳</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Lifespan</h3>
                        <p className="text-gray-600 dark:text-gray-400">{breed.longevity}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">🎨</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Common Colors</h3>
                        <p className="text-gray-600 dark:text-gray-400">{breed.color}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Characteristics Tab */}
          {activeTab === 'characteristics' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Physical Characteristics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 border-2 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl">📏</div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Height</h3>
                  </div>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{breed.height}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Measured at shoulder</p>
                </div>

                <div className="bg-linear-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6 border-2 border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl">⚖️</div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Weight</h3>
                  </div>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">{breed.weight}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Adult weight range</p>
                </div>

                <div className="bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6 border-2 border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl">🎨</div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Colors</h3>
                  </div>
                  <p className="text-lg font-semibold text-purple-700 dark:text-purple-400">{breed.color}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Common coat colors</p>
                </div>

                <div className="bg-linear-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-6 border-2 border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl">📐</div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Size</h3>
                  </div>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{breed.size || 'Medium'}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Size category</p>
                </div>
              </div>
            </div>
          )}

          {/* Health Tab */}
          {activeTab === 'health' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Health Information
              </h2>
              
              <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-6 border-2 border-red-200 dark:border-red-800">
                <div className="flex items-start gap-3 mb-4">
                  <div className="text-3xl">🏥</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Common Health Issues
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {breed.healthProblems}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-6 border-2 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl">💊</div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Preventive Care</h3>
                  </div>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 mt-1">✓</span>
                      <span>Regular veterinary check-ups (annually)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 mt-1">✓</span>
                      <span>Up-to-date vaccinations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 mt-1">✓</span>
                      <span>Dental care and cleaning</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 mt-1">✓</span>
                      <span>Parasite prevention</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-6 border-2 border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl">🥗</div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Nutrition</h3>
                  </div>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                      <span>{breed.mealsPerDay} meals per day recommended</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                      <span>High-quality breed-appropriate food</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                      <span>Portion control to maintain healthy weight</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                      <span>Fresh water always available</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-lg p-6 border-2 border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">⚠️</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Important Note
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      This information is general guidance. Always consult with a licensed veterinarian 
                      for specific health concerns and to develop a personalized care plan for your dog.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Costs Tab */}
          {activeTab === 'costs' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Cost of Ownership
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6 border-2 border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-4xl">💰</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Initial Cost</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Average puppy price</p>
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-green-700 dark:text-green-400 mb-2">
                    ${breed.avgPuppyPrice.toLocaleString()}
                  </div>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${priceInfo.color} bg-white dark:bg-zinc-800`}>
                    {priceInfo.text} Price Range
                  </div>
                </div>

                <div className="bg-linear-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-6 border-2 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-4xl">📅</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Annual Cost</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Yearly expenses</p>
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-blue-700 dark:text-blue-400 mb-2">
                    ${breed.yearlyExpenses.toLocaleString()}
                  </div>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${costInfo.color} bg-white dark:bg-zinc-800`}>
                    {costInfo.text} Maintenance
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border-2 border-gray-200 dark:border-zinc-600">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Estimated Cost Breakdown (Annual)
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Food', percentage: 35, amount: breed.yearlyExpenses * 0.35 },
                    { label: 'Veterinary Care', percentage: 30, amount: breed.yearlyExpenses * 0.30 },
                    { label: 'Grooming', percentage: 15, amount: breed.yearlyExpenses * 0.15 },
                    { label: 'Supplies & Toys', percentage: 10, amount: breed.yearlyExpenses * 0.10 },
                    { label: 'Training & Other', percentage: 10, amount: breed.yearlyExpenses * 0.10 }
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">{item.label}</span>
                        <span className="text-gray-600 dark:text-gray-400">
                          ${Math.round(item.amount).toLocaleString()} ({item.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-2">
                        <div 
                          className="bg-amber-600 h-2 rounded-full transition-all"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lifetime Cost */}
              <div className="bg-purple-50 dark:bg-purple-900/10 rounded-lg p-6 border-2 border-purple-200 dark:border-purple-800">
                <div className="flex items-start gap-3">
                  <div className="text-4xl">🏦</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Estimated Lifetime Cost
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Based on average lifespan of {breed.longevity}
                    </p>
                    {(() => {
                      const lifespanMatch = breed.longevity.match(/(\d+)-(\d+)/);
                      let avgLifespan = 12;
                      if (lifespanMatch) {
                        avgLifespan = (parseInt(lifespanMatch[1]) + parseInt(lifespanMatch[2])) / 2;
                      }
                      const lifetimeCost = breed.avgPuppyPrice + (breed.yearlyExpenses * avgLifespan);
                      return (
                        <div className="text-4xl font-bold text-purple-700 dark:text-purple-400">
                          ${Math.round(lifetimeCost).toLocaleString()}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Available Dogs Tab */}
          {activeTab === 'dogs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Available {breed.name}s
                </h2>
                <span className="px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-full font-semibold">
                  {dogsOfBreed.length} {dogsOfBreed.length === 1 ? 'Dog' : 'Dogs'}
                </span>
              </div>

              {dogsOfBreed.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No {breed.name}s Available
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    There are currently no {breed.name}s listed for breeding
                  </p>
                  <Link
                    to={ROUTES.DOGS}
                    className="inline-block px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-600 transition-colors font-semibold"
                  >
                    Browse Other Breeds
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dogsOfBreed.map(dog => (
                    <Link
                      key={dog.id}
                      to={getDogProfileRoute(dog.id)}
                      className="bg-white dark:bg-zinc-700 rounded-lg border-2 border-zinc-200 dark:border-zinc-600 hover:border-amber-500 dark:hover:border-amber-600 transition-all hover:shadow-xl overflow-hidden group"
                    >
                      {/* Dog Image */}
                      <div className="aspect-square relative overflow-hidden">
                        {dog.imageUrl ? (
                          <img
                            src={dog.imageUrl}
                            alt={dog.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-linear-to-br from-zinc-200 to-zinc-300 dark:from-zinc-600 dark:to-zinc-700 flex items-center justify-center text-8xl">
                            🐕
                          </div>
                        )}
                        
                        {/* Gender Badge */}
                        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full font-semibold text-sm shadow-lg ${
                          dog.gender === 'Male' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-pink-500 text-white'
                        }`}>
                          {dog.gender === 'Male' ? '♂️' : '♀️'} {dog.gender}
                        </div>
                      </div>

                      {/* Dog Info */}
                      <div className="p-4">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {dog.name}
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Age:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {dog.age} {dog.age === 1 ? 'year' : 'years'}
                            </span>
                          </div>
                          {dog.color && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Color:</span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {dog.color}
                              </span>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          className="w-full mt-4 px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-600 transition-colors font-semibold text-sm group-hover:bg-amber-600"
                        >
                          View Profile →
                        </button>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Breeds */}
      {relatedBreeds.length > 0 && (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Related Breeds ({breed.type} Group)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {relatedBreeds.map(relatedBreed => {
              const relatedBreedId = getBreedIdFromName(relatedBreed.name);
              return (
                <Link
                  key={relatedBreedId}
                  to={getBreedProfileRoute(relatedBreedId)}
                  className="bg-zinc-50 dark:bg-zinc-700 rounded-lg p-4 text-center hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors border-2 border-transparent hover:border-amber-500"
                >
                  {relatedBreed.imageUrl ? (
                    <img 
                      src={relatedBreed.imageUrl} 
                      alt={relatedBreed.name}
                      className="w-16 h-16 mx-auto object-cover rounded-full border-2 border-amber-500 mb-2"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <div className="text-4xl mb-2" style={{ display: relatedBreed.imageUrl ? 'none' : 'block' }}>🐕</div>
                  <div className="font-semibold text-sm text-gray-900 dark:text-white">
                    {relatedBreed.name}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Attribution Footer */}
      <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800 rounded-lg p-4">
        <p>
          Breed images and information courtesy of{' '}
          <a 
            href="https://www.thekennelclub.org.uk/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-amber-700 dark:text-amber-400 hover:underline font-medium"
          >
            The Kennel Club
          </a>
          {' '}• Educational use only
        </p>
      </div>
    </div>
  );
};

export default BreedProfile;