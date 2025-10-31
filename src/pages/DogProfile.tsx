// src/pages/DogProfile.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/context';
import { useMessaging } from '@/hooks/useMessaging';
import type { Dog } from '@/types/dog';
import toast from 'react-hot-toast';

const DogProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startConversation } = useMessaging();
  
  const [dog, setDog] = useState<Dog | null>(null);
  const [loading, setLoading] = useState(true);
  const [contactingOwner, setContactingOwner] = useState(false);

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

  const handleContactOwner = async () => {
  if (!user) {
    toast.error('Please log in to contact the owner');
    navigate('/');
    return;
  }

  if (!dog) return;

  // Check if user is trying to contact themselves
  if (dog.ownerId === user.uid) {
    toast.error("You can't message yourself!");
    return;
  }

  setContactingOwner(true);
  try {
    console.log('Attempting to contact owner:', dog.ownerId); // Debug log
    const conversationId = await startConversation(dog.ownerId);
    console.log('Conversation started:', conversationId); // Debug log
    navigate(`/messages/${conversationId}`);
    toast.success('Opening conversation...');
  } catch (error) {
    console.error('Error starting conversation:', error);
    // Show the actual error message
    const errorMessage = error instanceof Error ? error.message : 'Failed to start conversation';
    toast.error(errorMessage);
  } finally {
    setContactingOwner(false);
  }
};

  const handleRequestMatch = () => {
    if (!user) {
      toast.error('Please log in to request a match');
      navigate('/');
      return;
    }

    if (!dog) return;

    if (dog.ownerId === user.uid) {
      toast.error("You can't request a match with your own dog!");
      return;
    }

    // TODO: Implement match request functionality
    navigate('/add-match', { state: { selectedDog: dog } });
  };

  const handleViewOwnerProfile = () => {
    if (!dog) return;
    navigate(`/user/${dog.ownerId}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen" role="status">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#8c5628] dark:border-amber-500 mb-4" aria-hidden="true"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading dog profile...</p>
      </div>
    );
  }

  if (!dog) return null;

  const isOwnDog = user?.uid === dog.ownerId;

  return (
    <div className="max-w-4xl mx-auto my-10 p-6 sm:p-8 bg-white/95 dark:bg-zinc-800/95 rounded-xl shadow-xl backdrop-blur-sm border border-zinc-200 dark:border-zinc-700">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="Go back to previous page"
        className="mb-6 flex items-center gap-2 text-[#8c5628] dark:text-amber-400 hover:text-[#6d4320] dark:hover:text-amber-300 font-medium transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      {/* Own Dog Banner */}
      {isOwnDog && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-amber-800 dark:text-amber-200 font-medium flex items-center gap-2">
            <span>👤</span> This is your dog
          </p>
        </div>
      )}

      {/* Dog Image */}
      <div className="flex justify-center mb-8">
        {dog.imageUrl ? (
          <img
            src={dog.imageUrl}
            alt={`${dog.name} the ${dog.breed}`}
            className="w-48 h-48 rounded-full object-cover border-4 border-[#8c5628] dark:border-amber-600 shadow-lg"
          />
        ) : (
          <div className="w-48 h-48 rounded-full bg-linear-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-600 flex items-center justify-center text-7xl shadow-lg border-4 border-[#8c5628] dark:border-amber-600">
            🐕
          </div>
        )}
      </div>

      {/* Dog Name */}
      <h1 className="text-4xl font-bold text-center text-[#573a1c] dark:text-amber-200 mb-2">
        {dog.name}
      </h1>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
        {dog.breed} • {dog.age} {dog.age === 1 ? 'year' : 'years'} old • {dog.gender}
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
      {!isOwnDog ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            onClick={handleContactOwner}
            disabled={contactingOwner}
            className="px-6 py-3 bg-[#8c5628] dark:bg-amber-700 text-white rounded-lg hover:bg-[#6d4320] dark:hover:bg-amber-600 transition-colors font-semibold text-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {contactingOwner ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Connecting...
              </>
            ) : (
              <>
                💬 Contact Owner
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleRequestMatch}
            className="px-6 py-3 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors font-semibold text-lg shadow-md"
          >
            💕 Request Match
          </button>
        </div>
      ) : (
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate(`/edit-dog/${dog.id}`)}
            className="w-full px-6 py-3 bg-[#8c5628] dark:bg-amber-700 text-white rounded-lg hover:bg-[#6d4320] dark:hover:bg-amber-600 transition-colors font-semibold text-lg shadow-md"
          >
            ✏️ Edit Dog Profile
          </button>
        </div>
      )}

      {/* View Owner Profile */}
      {!isOwnDog && (
        <button
          type="button"
          onClick={handleViewOwnerProfile}
          className="w-full px-6 py-3 bg-zinc-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors font-medium shadow-sm flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          View Owner's Profile
        </button>
      )}
    </div>
  );
};

export default DogProfile;