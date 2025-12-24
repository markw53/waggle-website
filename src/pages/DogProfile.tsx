// src/pages/DogProfile.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@/firebase';
import { useAuth } from '@/context';
import { useMessaging } from '@/hooks/useMessaging';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import type { Dog } from '@/types/dog';
import { ROUTES, getConversationRoute, getUserProfileRoute, getEditDogRoute } from '@/config/routes'; // ✅ Added getUserProfileRoute and getEditDogRoute
import toast from 'react-hot-toast';
import { doc, doc as firestoreDoc, getDoc } from 'firebase/firestore';
import type { BreedInfo } from '@/types/breed';

const DogProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startConversation } = useMessaging();
  const { isAdmin } = useIsAdmin();
  
  const [dog, setDog] = useState<Dog | null>(null);
  const [loading, setLoading] = useState(true);
  const [contactingOwner, setContactingOwner] = useState(false);
  const [breedInfo, setBreedInfo] = useState<BreedInfo | null>(null);

  useEffect(() => {
    const fetchDog = async () => {
      if (!id) {
        toast.error('Invalid dog ID');
        navigate(ROUTES.DOGS);
        return;
      }
      
      setLoading(true);
      try {
        const dogDoc = await getDoc(doc(db, 'dogs', id));
        if (dogDoc.exists()) {
          const dogData = { id: dogDoc.id, ...dogDoc.data() } as Dog;
          
          // ✅ Updated check: Allow access if dog is approved, user is owner, OR user is admin
          const isOwner = dogData.ownerId === user?.uid;
          const isApproved = dogData.status === 'approved';
          
          if (!isApproved && !isOwner && !isAdmin) {
            toast.error('This dog is not yet approved for viewing');
            navigate(ROUTES.DOGS);
            return;
          }
          
          setDog(dogData);
        } else {
          toast.error('Dog not found');
          navigate(ROUTES.DOGS);
        }
      } catch (error) {
        console.error('Error fetching dog:', error);
        toast.error('Failed to load dog profile');
        navigate(ROUTES.DOGS);
      } finally {
        setLoading(false);
      }
    };

    fetchDog();
  }, [id, navigate, user, isAdmin]);

  // Add useEffect to fetch breed info
  useEffect(() => {
    const fetchBreedInfo = async () => {
      if (!dog?.breed) return;
      
      try {
        const breedId = dog.breed.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');
        
        const breedDoc = await getDoc(firestoreDoc(db, 'breeds', breedId));
        
        if (breedDoc.exists()) {
          setBreedInfo(breedDoc.data() as BreedInfo);
        }
      } catch (error) {
        console.error('Error fetching breed info:', error);
      }
    };
    
    fetchBreedInfo();
  }, [dog]);

  const handleContactOwner = async () => {
    if (!user) {
      toast.error('Please log in to contact the owner');
      navigate(ROUTES.HOME);
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
      console.log('Attempting to contact owner:', dog.ownerId);
      const conversationId = await startConversation(dog.ownerId);
      console.log('Conversation started:', conversationId);
      navigate(getConversationRoute(conversationId));
      toast.success('Opening conversation...');
    } catch (error) {
      console.error('Error starting conversation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start conversation';
      toast.error(errorMessage);
    } finally {
      setContactingOwner(false);
    }
  };

  const handleRequestMatch = () => {
    if (!user) {
      toast.error('Please log in to request a match');
      navigate(ROUTES.HOME);
      return;
    }

    if (!dog) return;

    if (dog.ownerId === user.uid) {
      toast.error("You can't request a match with your own dog!");
      return;
    }

    navigate(ROUTES.ADD_MATCH, { state: { selectedDog: dog } });
  };

  const handleViewOwnerProfile = () => {
    if (!dog) return;
    navigate(getUserProfileRoute(dog.ownerId)); // ✅ Updated
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
          <div className="flex items-center justify-between">
            <p className="text-amber-800 dark:text-amber-200 font-medium flex items-center gap-2">
              <span>👤</span> This is your dog
            </p>
            {/* ✅ Show status badge for own dogs */}
            {dog.status === 'pending' && (
              <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-sm font-semibold rounded-full">
                ⏳ Pending Approval
              </span>
            )}
            {dog.status === 'rejected' && (
              <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-sm font-semibold rounded-full">
                ❌ Rejected
              </span>
            )}
            {dog.status === 'approved' && (
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm font-semibold rounded-full">
                ✅ Approved
              </span>
            )}
          </div>
        </div>
      )}

      {/* ✅ Rejection reason for own dogs */}
      {isOwnDog && dog.status === 'rejected' && dog.adminVerification?.rejectionReason && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg">
          <h3 className="font-semibold text-red-900 dark:text-red-200 mb-2 flex items-center gap-2">
            <span>⚠️</span> Rejection Reason
          </h3>
          <p className="text-sm text-red-800 dark:text-red-300">
            {dog.adminVerification.rejectionReason}
          </p>
          <button
            type="button"
            onClick={() => navigate(getEditDogRoute(dog.id))} // ✅ Updated
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
          >
            Edit Dog to Resubmit
          </button>
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

      {/* Breed Information Section */}
      {breedInfo && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 p-6 rounded-lg mb-8">
          <h2 className="font-semibold text-xl text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <span>📚</span> About the {breedInfo.name} Breed
          </h2>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-white dark:bg-indigo-950 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Type</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{breedInfo.type}</p>
            </div>
            <div className="bg-white dark:bg-indigo-950 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Popularity</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">Rank #{breedInfo.popularity}</p>
            </div>
            <div className="bg-white dark:bg-indigo-950 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Intelligence</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">Rank #{breedInfo.intelligence}</p>
            </div>
            <div className="bg-white dark:bg-indigo-950 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Lifespan</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{breedInfo.longevity}</p>
            </div>
          </div>

          {/* Physical Traits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="bg-white dark:bg-indigo-950 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Height</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{breedInfo.height}</p>
            </div>
            <div className="bg-white dark:bg-indigo-950 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Weight</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{breedInfo.weight}</p>
            </div>
            <div className="bg-white dark:bg-indigo-950 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Colors</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{breedInfo.color}</p>
            </div>
          </div>
          
          {/* Health Issues Warning */}
          {breedInfo.healthProblems !== 'None reported' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800 mb-4">
              <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-200 mb-2 flex items-center gap-2">
                <span>🏥</span> Common Health Issues for {breedInfo.name}
              </p>
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                {breedInfo.healthProblems}
              </p>
            </div>
          )}
          
          {/* Cost Information */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white dark:bg-indigo-950 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800 text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Yearly Cost</p>
              <p className="font-bold text-green-600 dark:text-green-400">
                {breedInfo.yearlyExpenses
                  ? `£${breedInfo.yearlyExpenses.toLocaleString()}`
                  : 'N/A'}
              </p>
            </div>
            <div className="bg-white dark:bg-indigo-950 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800 text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Meals/Day</p>
              <p className="font-bold text-gray-900 dark:text-gray-100">
                {breedInfo.mealsPerDay}
              </p>
            </div>
            <div className="bg-white dark:bg-indigo-950 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800 text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Avg Puppy Price</p>
              <p className="font-bold text-blue-600 dark:text-blue-400">
                {breedInfo.avgPuppyPrice
                  ? `£${breedInfo.avgPuppyPrice.toLocaleString()}`
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>      )}

      {/* ✅ NEW: Kennel Club Information Section */}
      {dog.kennelClubInfo?.registrationNumber && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-6 rounded-lg mb-8">
          <h2 className="font-semibold text-xl text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <span>🏆</span> Kennel Club Registration
          </h2>
          
          <div className="space-y-4">
            {/* Registration Number */}
            <div className="bg-white dark:bg-blue-950 p-4 rounded-lg border border-blue-300 dark:border-blue-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">
                    Registration Number
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">
                    {dog.kennelClubInfo.registrationNumber}
                  </p>
                </div>
                {dog.kennelClubInfo.registrationVerified && (
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm font-semibold rounded-full flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Verified
                  </span>
                )}
              </div>
            </div>

            {/* Registered Name (if different) */}
            {dog.kennelClubInfo.registeredName && dog.kennelClubInfo.registeredName !== dog.name && (
              <div className="bg-white dark:bg-blue-950 p-4 rounded-lg border border-blue-300 dark:border-blue-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">
                  Registered Name
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {dog.kennelClubInfo.registeredName}
                </p>
              </div>
            )}

            {/* Registration Document */}
            {dog.kennelClubInfo.registrationDocumentUrl && (
              <div>
                <a
                  href={dog.kennelClubInfo.registrationDocumentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-700 dark:text-blue-300 hover:underline font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Registration Certificate
                </a>
              </div>
            )}

            {/* Links to KC */}
            <div className="pt-4 border-t border-blue-200 dark:border-blue-700 space-y-2">
              <a
                href={`https://www.thekennelclub.org.uk/search/breeds-a-to-z/breeds/${dog.breed.toLowerCase().replace(/ /g, '-')}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-700 dark:text-blue-300 hover:underline font-medium text-sm"
              >
                📖 View {dog.breed} Breed Standard
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              
              <a
                href="https://www.thekennelclub.org.uk/health-and-dog-care/breed-health-and-care-schemes/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-700 dark:text-blue-300 hover:underline font-medium text-sm"
              >
                🏥 Health Testing Requirements
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons - Only show for approved dogs or hide for pending/rejected */}
      {!isOwnDog && dog.status === 'approved' && (
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
      )}

      {isOwnDog && (
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate(getEditDogRoute(dog.id))} // ✅ Updated
            className="w-full px-6 py-3 bg-[#8c5628] dark:bg-amber-700 text-white rounded-lg hover:bg-[#6d4320] dark:hover:bg-amber-600 transition-colors font-semibold text-lg shadow-md"
          >
            ✏️ Edit Dog Profile
          </button>
        </div>
      )}

      {/* View Owner Profile - Only for approved dogs */}
      {!isOwnDog && dog.status === 'approved' && (
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