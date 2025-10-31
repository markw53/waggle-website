// src/pages/MyDogs.tsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/context';
import type { Dog } from '@/types/dog';
import DogCard from '@/components/DogCard';
import toast from 'react-hot-toast';

const MyDogs: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');

  const fetchMyDogs = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const dogsQuery = query(
        collection(db, 'dogs'),
        where('ownerId', '==', user.uid)
      );
      
      const snapshot = await getDocs(dogsQuery);
      const fetchedDogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Dog[];

      setDogs(fetchedDogs);
    } catch (error) {
      console.error('Error fetching dogs:', error);
      toast.error('Failed to load your dogs');
    } finally {
      setLoading(false);
    }
  }, [user]); // ✅ Add user as dependency

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    fetchMyDogs();
  }, [user, navigate, fetchMyDogs]); // ✅ Now includes fetchMyDogs

  const handleDeleteDog = async (dogId: string, dogName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${dogName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'dogs', dogId));
      setDogs(dogs.filter(d => d.id !== dogId));
      toast.success(`${dogName} has been deleted`);
    } catch (error) {
      console.error('Error deleting dog:', error);
      toast.error('Failed to delete dog');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#8c5628] dark:border-amber-500 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading your dogs...</p>
      </div>
    );
  }

  const filteredDogs = filter === 'all' 
    ? dogs 
    : dogs.filter(dog => dog.status === filter);

  const statusCounts = {
    all: dogs.length,
    approved: dogs.filter(d => d.status === 'approved').length,
    pending: dogs.filter(d => d.status === 'pending').length,
    rejected: dogs.filter(d => d.status === 'rejected').length,
  };

  return (
    <div className="max-w-7xl mx-auto my-10 p-6">
        {/* Header */}
        <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <div>
            <h1 className="text-4xl font-bold text-[#573a1c] dark:text-amber-200 mb-2">
                🐕 My Dogs
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
                Manage your registered dogs
            </p>
            </div>
            <button
            type="button"
            onClick={() => navigate('/add-dog')}
            className="px-6 py-3 bg-[#8c5628] dark:bg-amber-700 text-white rounded-lg hover:bg-[#6d4320] dark:hover:bg-amber-600 transition-colors font-semibold shadow-md flex items-center gap-2"
            >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Dog
            </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filter === 'all'
                ? 'bg-[#8c5628] dark:bg-amber-700 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            All ({statusCounts.all})
          </button>
          <button
            type="button"
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filter === 'approved'
                ? 'bg-green-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            ✅ Approved ({statusCounts.approved})
          </button>
          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filter === 'pending'
                ? 'bg-amber-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            ⏳ Pending ({statusCounts.pending})
          </button>
          <button
            type="button"
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filter === 'rejected'
                ? 'bg-red-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            ❌ Rejected ({statusCounts.rejected})
          </button>
        </div>
      </div>

      {/* Dogs Grid */}
      {filteredDogs.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
          <div className="text-6xl mb-4">🐕</div>
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {filter === 'all' ? 'No Dogs Yet' : `No ${filter.charAt(0).toUpperCase() + filter.slice(1)} Dogs`}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {filter === 'all' 
              ? "You haven't registered any dogs yet." 
              : `You don't have any ${filter} dogs.`}
          </p>
          {filter === 'all' && (
            <button
              type="button"
              onClick={() => navigate('/add-dog')}
              className="px-6 py-3 bg-[#8c5628] dark:bg-amber-700 text-white rounded-lg hover:bg-[#6d4320] dark:hover:bg-amber-600 transition-colors font-semibold"
            >
              Register Your First Dog
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDogs.map(dog => (
            <div key={dog.id} className="relative">
              {/* Status Badge */}
              <div className="absolute top-4 right-4 z-10">
                {dog.status === 'approved' && (
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs font-semibold rounded-full">
                    ✅ Approved
                  </span>
                )}
                {dog.status === 'pending' && (
                  <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-xs font-semibold rounded-full">
                    ⏳ Pending
                  </span>
                )}
                {dog.status === 'rejected' && (
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-xs font-semibold rounded-full">
                    ❌ Rejected
                  </span>
                )}
              </div>

              <DogCard dog={dog} />

              {/* Action Buttons */}
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/dog/${dog.id}`)}
                  className="flex-1 px-4 py-2 bg-[#8c5628] dark:bg-amber-700 text-white rounded-lg hover:bg-[#6d4320] dark:hover:bg-amber-600 transition-colors font-medium text-sm"
                >
                  View
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/edit-dog/${dog.id}`)}
                  className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium text-sm"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteDog(dog.id, dog.name)}
                  className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors font-medium text-sm"
                >
                  🗑️
                </button>
              </div>

              {/* Rejection Reason */}
              {dog.status === 'rejected' && dog.adminVerification?.rejectionReason && (
                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-xs font-semibold text-red-900 dark:text-red-200 mb-1">
                    Rejection Reason:
                  </p>
                  <p className="text-xs text-red-800 dark:text-red-300">
                    {dog.adminVerification.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyDogs;