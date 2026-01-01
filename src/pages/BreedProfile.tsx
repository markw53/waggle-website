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
  const [activeTab, setActiveTab] = useState<'overview' | 'characteristics' | 'health' | 'dogs'>('overview');

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
          where('status', '==', 'approved')
        );
        const dogsSnapshot = await getDocs(dogsQuery);

        // Filter in memory for exact match
        const dogs = dogsSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Dog))
          .filter(dog => 
            dog.breed.toLowerCase().trim() === breedData.name.toLowerCase().trim()
          ); // Exact match now possible

        console.log(`Found ${dogs.length} dogs for breed ${breedData.name}`);
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

      {/* Header with Kennel Club Image - IMPROVED BACKGROUND */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8 mb-6 border-2 border-amber-200 dark:border-amber-700">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Breed Image from Kennel Club */}
          <div className="bg-linear-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full p-2">
            {breed.imageUrl ? (
              <img 
                src={breed.imageUrl} 
                alt={breed.name}
                className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-full border-4 border-amber-500 shadow-xl"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center text-6xl md:text-8xl" 
              style={{ display: breed.imageUrl ? 'none' : 'flex' }}
            >
              🐕
            </div>
          </div>
          
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
              <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 rounded-full text-sm font-medium border border-amber-300 dark:border-amber-700">
                {breed.type}
              </span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-200 rounded-full text-sm font-medium border border-blue-300 dark:border-blue-700">
                {dogsOfBreed.length} Available
              </span>
            </div>
            
            {/* Official Kennel Club Link */}
            {breed.officialLink && (
              <a 
                href={breed.officialLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 hover:underline font-medium"
              >
                <span>📖</span> View Official Royal Kennel Club Page
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
              className="px-6 py-3 bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors font-semibold text-center border-2 border-gray-300 dark:border-zinc-600"
            >
              All Breeds
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 text-center border-2 border-transparent hover:border-amber-500 transition-colors">
          <div className="text-3xl mb-2">📏</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Height</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {breed.height}
          </div>
        </div>
        
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 text-center border-2 border-transparent hover:border-green-500 transition-colors">
          <div className="text-3xl mb-2">⚖️</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Weight</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {breed.weight}
          </div>
        </div>
        
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 text-center border-2 border-transparent hover:border-blue-500 transition-colors">
          <div className="text-3xl mb-2">🏃</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Exercise</div>
          <div className="text-xs font-bold text-gray-900 dark:text-white">
            {breed.exerciseNeeds || 'Varies'}
          </div>
        </div>
        
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 text-center border-2 border-transparent hover:border-purple-500 transition-colors">
          <div className="text-3xl mb-2">⏳</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Lifespan</div>
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {breed.longevity}
          </div>
        </div>
      </div>

      {/* Kennel Club Specific Info - IMPROVED BACKGROUND */}
      {(breed.temperament || breed.exerciseNeeds || breed.grooming || breed.goodWithChildren) && (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 mb-6 border-2 border-blue-300 dark:border-blue-700">
          <div className="bg-linear-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-6 border-2 border-blue-200 dark:border-blue-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>🏆</span> Royal Kennel Club Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {breed.temperament && (
                <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <span>😊</span> Temperament
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{breed.temperament}</p>
                </div>
              )}
              {breed.exerciseNeeds && (
                <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <span>🏃</span> Exercise Needs
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{breed.exerciseNeeds}</p>
                </div>
              )}
              {breed.grooming && (
                <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <span>✂️</span> Grooming
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{breed.grooming}</p>
                </div>
              )}
              {breed.goodWithChildren && (
                <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <span>👶</span> Good with Children
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{breed.goodWithChildren}</p>
                </div>
              )}
            </div>
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
                    <div className="flex items-start gap-3 bg-gray-50 dark:bg-zinc-700/50 rounded-lg p-4">
                      <div className="text-2xl">🏆</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Breed Group</h3>
                        <p className="text-gray-600 dark:text-gray-400">{breed.kennelClubCategory || breed.type}</p>
                      </div>
                    </div>
                    {breed.size && (
                      <div className="flex items-start gap-3 bg-gray-50 dark:bg-zinc-700/50 rounded-lg p-4">
                        <div className="text-2xl">📐</div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Size Category</h3>
                          <p className="text-gray-600 dark:text-gray-400">{breed.size}</p>
                        </div>
                      </div>
                    )}
                    {breed.exerciseNeeds && (
                      <div className="flex items-start gap-3 bg-gray-50 dark:bg-zinc-700/50 rounded-lg p-4">
                        <div className="text-2xl">🏃</div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Exercise Requirements</h3>
                          <p className="text-gray-600 dark:text-gray-400">{breed.exerciseNeeds}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    {breed.grooming && (
                      <div className="flex items-start gap-3 bg-gray-50 dark:bg-zinc-700/50 rounded-lg p-4">
                        <div className="text-2xl">✂️</div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Grooming</h3>
                          <p className="text-gray-600 dark:text-gray-400">{breed.grooming}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3 bg-gray-50 dark:bg-zinc-700/50 rounded-lg p-4">
                      <div className="text-2xl">⏳</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Lifespan</h3>
                        <p className="text-gray-600 dark:text-gray-400">{breed.longevity}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-gray-50 dark:bg-zinc-700/50 rounded-lg p-4">
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

                {breed.size && (
                  <div className="bg-linear-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-6 border-2 border-orange-200 dark:border-orange-800">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-3xl">📐</div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Size</h3>
                    </div>
                    <p className="text-lg font-bold text-orange-700 dark:text-orange-400">{breed.size}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Size category</p>
                  </div>
                )}
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
                      Health Considerations
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
                    <div className="text-3xl">⏳</div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Lifespan</h3>
                  </div>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-400 mb-2">
                    {breed.longevity}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Expected lifespan with proper care
                  </p>
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
            href="https://www.royalkennelclub.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-amber-700 dark:text-amber-400 hover:underline font-medium"
          >
            The Royal Kennel Club
          </a>
          {' '}• Educational use only
        </p>
      </div>
    </div>
  );
};

export default BreedProfile;