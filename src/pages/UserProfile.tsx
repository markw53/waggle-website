import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import type { UserProfile } from '@/types/user';
import type { Dog } from '@/types/dog';
import DogCard from '@/components/DogCard';
import toast from 'react-hot-toast';

const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userDogs, setUserDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!id) {
        toast.error('Invalid user ID');
        navigate('/dogs');
        return;
      }

      setLoading(true);
      try {
        // Fetch user profile
        const userDoc = await getDoc(doc(db, 'users', id));
        if (!userDoc.exists()) {
          toast.error('User not found');
          navigate('/dogs');
          return;
        }

        setUserProfile({ uid: userDoc.id, ...userDoc.data() } as UserProfile);

        // Fetch user's dogs
        const dogsQuery = query(collection(db, 'dogs'), where('ownerId', '==', id));
        const dogsSnapshot = await getDocs(dogsQuery);
        const dogs = dogsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Dog[];

        setUserDogs(dogs);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Failed to load user profile');
        navigate('/dogs');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen" role="status">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#8c5628] dark:border-amber-500 mb-4" aria-hidden="true"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading user profile...</p>
      </div>
    );
  }

  if (!userProfile) return null;

  return (
    <div className="max-w-6xl mx-auto my-10 p-6 sm:p-8 bg-white/95 dark:bg-zinc-800/95 rounded-xl shadow-xl backdrop-blur-sm border border-zinc-200 dark:border-zinc-700">
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

      {/* User Header */}
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-8 border-b border-zinc-200 dark:border-zinc-700">
        {/* Profile Picture */}
        {userProfile.photoURL ? (
          <img
            src={userProfile.photoURL}
            alt={userProfile.displayName || 'User'}
            className="w-32 h-32 rounded-full object-cover border-4 border-[#8c5628] dark:border-amber-600 shadow-lg"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-linear-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-600 flex items-center justify-center text-5xl border-4 border-[#8c5628] dark:border-amber-600 shadow-lg">
            👤
          </div>
        )}

        {/* User Info */}
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-[#573a1c] dark:text-amber-200 mb-2">
            {userProfile.displayName || 'Anonymous User'}
          </h1>
          {userProfile.location && (
            <p className="text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2 justify-center sm:justify-start">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {userProfile.location}
            </p>
          )}
          {userProfile.bio && (
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl">
              {userProfile.bio}
            </p>
          )}
        </div>

        {/* Contact Buttons */}
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              if (userProfile.email) {
                window.location.href = `mailto:${userProfile.email}`;
              } else {
                toast.error('Email not available');
              }
            }}
            className="px-6 py-2.5 bg-[#8c5628] dark:bg-amber-700 text-white rounded-lg hover:bg-[#6d4320] dark:hover:bg-amber-600 transition-colors font-medium shadow-md flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Send Email
          </button>
          {userProfile.phoneNumber && (
            <a
              href={`tel:${userProfile.phoneNumber}`}
              className="px-6 py-2.5 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors font-medium shadow-md flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Owner
            </a>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg border border-zinc-200 dark:border-zinc-600">
          <p className="text-3xl font-bold text-[#8c5628] dark:text-amber-500">{userDogs.length}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Dogs</p>
        </div>
        <div className="text-center p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg border border-zinc-200 dark:border-zinc-600">
          <p className="text-3xl font-bold text-[#8c5628] dark:text-amber-500">
            {userDogs.filter(d => d.gender === 'Male').length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Males</p>
        </div>
        <div className="text-center p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg border border-zinc-200 dark:border-zinc-600">
          <p className="text-3xl font-bold text-[#8c5628] dark:text-amber-500">
            {userDogs.filter(d => d.gender === 'Female').length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Females</p>
        </div>
        <div className="text-center p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg border border-zinc-200 dark:border-zinc-600">
          <p className="text-3xl font-bold text-[#8c5628] dark:text-amber-500">
            {new Set(userDogs.map(d => d.breed)).size}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Breeds</p>
        </div>
      </div>

      {/* User's Dogs Section */}
      <div>
        <h2 className="text-2xl font-bold text-[#573a1c] dark:text-amber-200 mb-6 flex items-center gap-2">
          <span>🐕</span>
          {userProfile.displayName ? `${userProfile.displayName}'s Dogs` : 'Dogs'} ({userDogs.length})
        </h2>

        {userDogs.length === 0 ? (
          <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg border border-zinc-200 dark:border-zinc-600">
            <div className="text-6xl mb-4">🐕</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Dogs Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              This user hasn't added any dogs yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userDogs.map(dog => (
              <DogCard key={dog.id} dog={dog} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;