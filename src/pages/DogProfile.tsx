import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import type { Dog } from '@/types/dog';
import toast from 'react-hot-toast';

const DogProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dog, setDog] = useState<Dog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDog = async () => {
      if (!id) {
        toast.error('Invalid dog ID');
        navigate('/dogs');
        return;
      }
      
      setLoading(true);
      try {
        const dogDoc = await getDoc(doc(db, 'dogs', id));
        if (dogDoc.exists()) {
          setDog({ id: dogDoc.id, ...dogDoc.data() } as Dog);
        } else {
          toast.error('Dog not found');
          navigate('/dogs');
        }
      } catch (error) {
        console.error('Error fetching dog:', error);
        toast.error('Failed to load dog profile');
        navigate('/dogs');
      } finally {
        setLoading(false);
      }
    };

    fetchDog();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen" role="status">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#8c5628] dark:border-amber-500 mb-4" aria-hidden="true"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading dog profile...</p>
      </div>
    );
  }

  if (!dog) return null;

  return (
    <div className="max-w-4xl mx-auto my-10 p-6 sm:p-8 bg-white/95 dark:bg-zinc-800/95 rounded-xl shadow-xl backdrop-blur-sm border border-zinc-200 dark:border-zinc-700">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        aria-label="Go back to previous page"
        className="mb-6 flex items-center gap-2 text-[#8c5628] dark:text-amber-400 hover:text-[#6d4320] dark:hover:text-amber-300 font-medium transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      {/* Dog Image */}
      <div className="flex justify-center mb-8">
        {dog.imageUrl ? (
          <img
            src={dog.imageUrl}
            alt={`${dog.name} the ${dog.breed}`}
            className="w-48 h-48 rounded-full object-cover border-4 border-[#8c5628] dark:border-amber-600 shadow-lg"
          />
        ) : (
          <div className="w-48 h-48 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-600 flex items-center justify-center text-7xl shadow-lg">
            🐕
          </div>
        )}
      </div>

      {/* Dog Name */}
      <h1 className="text-4xl font-bold text-center text-[#573a1c] dark:text-amber-200 mb-2">
        {dog.name}
      </h1>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
        {dog.breed} • {dog.age} {dog.age === 1 ? 'year' : 'years'} old
      </p>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-zinc-50 dark:bg-zinc-700/50 p-5 rounded-lg border border-zinc-200 dark:border-zinc-600">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🐾</span>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Breed</p>
              <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">{dog.breed}</p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-700/50 p-5 rounded-lg border border-zinc-200 dark:border-zinc-600">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎂</span>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Age</p>
              <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                {dog.age} {dog.age === 1 ? 'year' : 'years'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-700/50 p-5 rounded-lg border border-zinc-200 dark:border-zinc-600">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{dog.gender === 'Male' ? '♂️' : '♀️'}</span>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Gender</p>
              <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">{dog.gender}</p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-700/50 p-5 rounded-lg border border-zinc-200 dark:border-zinc-600">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📅</span>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Registered</p>
              <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                {dog.createdAt?.toDate ? new Date(dog.createdAt.toDate()).toLocaleDateString() : 'Recently'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      {dog.bio && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-6 rounded-lg mb-8">
          <h2 className="font-semibold text-xl text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <span>ℹ️</span> About {dog.name}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{dog.bio}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => {
            // TODO: Implement contact owner functionality
            toast.success('Contact feature coming soon!');
          }}
          className="px-6 py-3 bg-[#8c5628] dark:bg-amber-700 text-white rounded-lg hover:bg-[#6d4320] dark:hover:bg-amber-600 transition-colors font-semibold text-lg shadow-md"
        >
          📧 Contact Owner
        </button>
        <button
          onClick={() => navigate('/add-match')}
          className="px-6 py-3 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors font-semibold text-lg shadow-md"
        >
          💕 Request Match
        </button>
      </div>

      {/* Owner Info (Optional - only show if you want) */}
      <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-700 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Owner ID: <code className="bg-zinc-100 dark:bg-zinc-700 px-2 py-1 rounded text-xs">{dog.ownerId}</code>
        </p>
      </div>
    </div>
  );
};

export default DogProfile;