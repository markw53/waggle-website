// src/pages/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, doc, updateDoc, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/context';
import type { Dog } from '@/types/dog';
import toast from 'react-hot-toast';
import { useIsAdmin } from '@/hooks/useIsAdmin';

type TabType = 'pending' | 'all' | 'stats';
type FilterStatus = 'all' | 'approved' | 'rejected' | 'suspended' | 'pending';

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  suspended: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [pendingDogs, setPendingDogs] = useState<Dog[]>([]);
  const [allDogs, setAllDogs] = useState<Dog[]>([]);
  const [filteredDogs, setFilteredDogs] = useState<Dog[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    suspended: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [suspensionReason, setSuspensionReason] = useState('');
  
  // Filters for "All Dogs" tab
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  useEffect(() => {
    if (!user || (!adminLoading && !isAdmin)) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }

    if (!adminLoading && isAdmin) {
      fetchAllData();
    }
  }, [user, isAdmin, adminLoading, navigate]);

  // Filter dogs based on search and status
  useEffect(() => {
    let filtered = [...allDogs];

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(dog => dog.status === filterStatus);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(dog => 
        dog.name.toLowerCase().includes(term) ||
        dog.breed.toLowerCase().includes(term) ||
        dog.id.toLowerCase().includes(term)
      );
    }

    setFilteredDogs(filtered);
  }, [allDogs, searchTerm, filterStatus]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch all dogs
      const allDogsQuery = query(
        collection(db, 'dogs'),
        orderBy('createdAt', 'desc')
      );
      const allDogsSnapshot = await getDocs(allDogsQuery);
      const allDogsData = allDogsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Dog[];

      setAllDogs(allDogsData);

      // Filter pending dogs
      const pending = allDogsData.filter(dog => dog.status === 'pending');
      setPendingDogs(pending);

      // Calculate stats
      const newStats: Stats = {
        total: allDogsData.length,
        pending: allDogsData.filter(dog => dog.status === 'pending').length,
        approved: allDogsData.filter(dog => dog.status === 'approved').length,
        rejected: allDogsData.filter(dog => dog.status === 'rejected').length,
        suspended: allDogsData.filter(dog => dog.status === 'suspended').length,
      };
      setStats(newStats);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (dogId: string) => {
    if (!user) return;
    
    try {
      const dogRef = doc(db, 'dogs', dogId);
      await updateDoc(dogRef, {
        status: 'approved',
        'adminVerification.verified': true,
        'adminVerification.verifiedBy': user.uid,
        'adminVerification.verifiedAt': Timestamp.fromDate(new Date()),
        'adminVerification.verificationNotes': verificationNotes || 'Approved',
      });
      
      toast.success('Dog approved for breeding!');
      fetchAllData();
      setSelectedDog(null);
      setVerificationNotes('');
    } catch (error) {
      console.error('Error approving dog:', error);
      toast.error('Failed to approve dog');
    }
  };

  const handleReject = async (dogId: string) => {
    if (!user || !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    try {
      const dogRef = doc(db, 'dogs', dogId);
      await updateDoc(dogRef, {
        status: 'rejected',
        'adminVerification.verified': false,
        'adminVerification.verifiedBy': user.uid,
        'adminVerification.verifiedAt': Timestamp.fromDate(new Date()),
        'adminVerification.rejectionReason': rejectionReason,
      });
      
      toast.success('Dog rejected with feedback sent to owner');
      fetchAllData();
      setSelectedDog(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting dog:', error);
      toast.error('Failed to reject dog');
    }
  };

  const handleSuspend = async (dogId: string) => {
    if (!suspensionReason.trim()) {
      toast.error('Please provide a reason for suspension');
      return;
    }

    try {
      const dogRef = doc(db, 'dogs', dogId);
      await updateDoc(dogRef, {
        status: 'suspended',
        suspendedReason: suspensionReason,
        'adminVerification.verifiedBy': user?.uid,
        'adminVerification.verifiedAt': Timestamp.fromDate(new Date()),
      });

      toast.success('Dog suspended successfully');
      fetchAllData();
      setSelectedDog(null);
      setSuspensionReason('');
    } catch (error) {
      console.error('Error suspending dog:', error);
      toast.error('Failed to suspend dog');
    }
  };

  const handleUnsuspend = async (dogId: string) => {
    try {
      const dogRef = doc(db, 'dogs', dogId);
      await updateDoc(dogRef, {
        status: 'approved',
        suspendedReason: '',
      });

      toast.success('Dog unsuspended successfully');
      fetchAllData();
      setSelectedDog(null);
    } catch (error) {
      console.error('Error unsuspending dog:', error);
      toast.error('Failed to unsuspend dog');
    }
  };

  if (adminLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#8c5628] dark:border-amber-500 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto my-10 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#573a1c] dark:text-amber-200 mb-2">
          🛡️ Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage dog verifications and monitor platform activity
        </p>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Dogs</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-800 dark:text-amber-400 mb-1">Pending</p>
          <p className="text-3xl font-bold text-amber-900 dark:text-amber-200">{stats.pending}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-800 dark:text-green-400 mb-1">Approved</p>
          <p className="text-3xl font-bold text-green-900 dark:text-green-200">{stats.approved}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-800 dark:text-red-400 mb-1">Rejected</p>
          <p className="text-3xl font-bold text-red-900 dark:text-red-200">{stats.rejected}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-800 dark:text-gray-400 mb-1">Suspended</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-200">{stats.suspended}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        <div className="border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex">
            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'pending'
                  ? 'bg-[#8c5628] dark:bg-amber-700 text-white'
                  : 'bg-zinc-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
              }`}
            >
              ⏳ Pending Approval ({stats.pending})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'all'
                  ? 'bg-[#8c5628] dark:bg-amber-700 text-white'
                  : 'bg-zinc-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
              }`}
            >
              📋 All Dogs ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('stats')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'stats'
                  ? 'bg-[#8c5628] dark:bg-amber-700 text-white'
                  : 'bg-zinc-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
              }`}
            >
              📊 Statistics
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* PENDING TAB */}
          {activeTab === 'pending' && (
            <div>
              {pendingDogs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    All Caught Up!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    No pending verifications at the moment
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {pendingDogs.map((dog) => (
                    <DogVerificationCard
                      key={dog.id}
                      dog={dog}
                      onReview={setSelectedDog}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ALL DOGS TAB */}
          {activeTab === 'all' && (
            <div>
              {/* Filters */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="search" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Search by name, breed, or ID
                  </label>
                  <input
                    id="search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search dogs..."
                    className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg"
                  />
                </div>
                <div>
                  <label htmlFor="status-filter" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Filter by status
                  </label>
                  <select
                    id="status-filter"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                    className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Dogs List */}
              <div className="space-y-4">
                {filteredDogs.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-400">No dogs found</p>
                  </div>
                ) : (
                  filteredDogs.map((dog) => (
                    <DogManagementCard
                      key={dog.id}
                      dog={dog}
                      onReview={setSelectedDog}
                      onSuspend={(dog) => {
                        setSelectedDog(dog);
                        setSuspensionReason('');
                      }}
                      onUnsuspend={handleUnsuspend}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* STATISTICS TAB */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status Distribution */}
                <div className="bg-zinc-50 dark:bg-zinc-700/50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Status Distribution
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 dark:text-gray-300">Approved</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {stats.approved} ({stats.total > 0 ? ((stats.approved / stats.total) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 dark:text-gray-300">Pending</span>
                      <span className="font-semibold text-amber-600 dark:text-amber-400">
                        {stats.pending} ({stats.total > 0 ? ((stats.pending / stats.total) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 dark:text-gray-300">Rejected</span>
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        {stats.rejected} ({stats.total > 0 ? ((stats.rejected / stats.total) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 dark:text-gray-300">Suspended</span>
                      <span className="font-semibold text-gray-600 dark:text-gray-400">
                        {stats.suspended} ({stats.total > 0 ? ((stats.suspended / stats.total) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-zinc-50 dark:bg-zinc-700/50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Platform Health
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 dark:text-gray-300">Approval Rate</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {stats.total > 0 ? ((stats.approved / (stats.approved + stats.rejected)) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 dark:text-gray-300">Pending Review</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {stats.pending}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 dark:text-gray-300">Active Issues</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {stats.suspended}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Breed Distribution */}
              <div className="bg-zinc-50 dark:bg-zinc-700/50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Top Breeds
                </h3>
                <TopBreedsDisplay dogs={allDogs} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedDog && (
        <ReviewModal
          dog={selectedDog}
          verificationNotes={verificationNotes}
          setVerificationNotes={setVerificationNotes}
          rejectionReason={rejectionReason}
          setRejectionReason={setRejectionReason}
          suspensionReason={suspensionReason}
          setSuspensionReason={setSuspensionReason}
          onApprove={handleApprove}
          onReject={handleReject}
          onSuspend={handleSuspend}
          onUnsuspend={handleUnsuspend}
          onClose={() => {
            setSelectedDog(null);
            setVerificationNotes('');
            setRejectionReason('');
            setSuspensionReason('');
          }}
        />
      )}
    </div>
  );
};

// Dog Verification Card Component (for Pending tab)
const DogVerificationCard: React.FC<{
  dog: Dog;
  onReview: (dog: Dog) => void;
}> = ({ dog, onReview }) => (
  <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700">
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Dog Image */}
      <div className="shrink-0">
        {dog.imageUrl ? (
          <img
            src={dog.imageUrl}
            alt={dog.name}
            className="w-48 h-48 rounded-lg object-cover border-2 border-[#8c5628] dark:border-amber-600"
          />
        ) : (
          <div className="w-48 h-48 rounded-lg bg-linear-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-600 flex items-center justify-center text-6xl">
            🐕
          </div>
        )}
      </div>

      {/* Dog Info */}
      <div className="flex-1">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {dog.name}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {dog.breed} • {dog.age} years • {dog.gender}
        </p>

                {/* Eligibility Status */}
        <div
          className={`inline-block px-4 py-2 rounded-lg mb-4 ${
            dog.breedingEligibility.isEligible
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200'
          }`}
        >
          {dog.breedingEligibility.isEligible
            ? '✅ Meets Basic Requirements'
            : `⚠️ ${dog.breedingEligibility.reasonIfIneligible}`}
        </div>

        {/* Health Info Summary */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-zinc-50 dark:bg-zinc-700 p-3 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Vet Verified</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {dog.healthInfo.vetVerified ? '✅ Yes' : '❌ No'}
            </p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-700 p-3 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Brucellosis</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {dog.healthInfo.brucellosisTest ? '✅ Negative' : '❌ Not Tested'}
            </p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-700 p-3 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Vaccinations</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {dog.healthInfo.vaccinationUpToDate ? '✅ Current' : '❌ Outdated'}
            </p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-700 p-3 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Genetic Testing</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {dog.healthInfo.geneticTestingDone ? '✅ Done' : '⚠️ Not Done'}
            </p>
          </div>
        </div>

        {/* Documents */}
        {(dog.healthInfo.vetCertificateUrl || dog.healthInfo.vaccinationRecordUrl) && (
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Documents
            </h3>
            <div className="space-y-2">
              {dog.healthInfo.vetCertificateUrl && (
                <a
                  href={dog.healthInfo.vetCertificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  📄 Veterinary Certificate
                </a>
              )}
              {dog.healthInfo.vaccinationRecordUrl && (
                <a
                  href={dog.healthInfo.vaccinationRecordUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  💉 Vaccination Record
                </a>
              )}
            </div>
          </div>
        )}

        {/* Veterinarian Info */}
        {dog.healthInfo.vetName && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Veterinarian Contact
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Name:</span> {dog.healthInfo.vetName}
            </p>
            {dog.healthInfo.vetPhone && (
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">Phone:</span> {dog.healthInfo.vetPhone}
              </p>
            )}
          </div>
        )}

        {/* Action Button */}
        <button
          type="button"
          onClick={() => onReview(dog)}
          className="w-full px-4 py-2 bg-[#8c5628] dark:bg-amber-700 text-white rounded-lg hover:bg-[#6d4320] dark:hover:bg-amber-600 transition-colors font-semibold"
        >
          Review Details
        </button>
      </div>
    </div>
  </div>
);

// Dog Management Card Component (for All Dogs tab)
const DogManagementCard: React.FC<{
  dog: Dog;
  onReview: (dog: Dog) => void;
  onSuspend: (dog: Dog) => void;
  onUnsuspend: (dogId: string) => void;
}> = ({ dog, onReview, onSuspend, onUnsuspend }) => {
  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200',
      approved: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
      rejected: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
      suspended: 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200',
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  return (
    <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700">
      <div className="flex items-start gap-4">
        {/* Dog Image */}
        <div className="shrink-0">
          {dog.imageUrl ? (
            <img
              src={dog.imageUrl}
              alt={dog.name}
              className="w-20 h-20 rounded-lg object-cover border-2 border-[#8c5628] dark:border-amber-600"
            />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-linear-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-600 flex items-center justify-center text-3xl">
              🐕
            </div>
          )}
        </div>

        {/* Dog Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {dog.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {dog.breed} • {dog.age} years • {dog.gender}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(dog.status)}`}>
              {dog.status.charAt(0).toUpperCase() + dog.status.slice(1)}
            </span>
          </div>

          {/* ID */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            ID: {dog.id}
          </p>

          {/* Suspension/Rejection Reason */}
          {dog.status === 'suspended' && dog.suspendedReason && (
            <div className="bg-gray-50 dark:bg-gray-900/30 p-2 rounded mb-3">
              <p className="text-xs text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Suspended:</span> {dog.suspendedReason}
              </p>
            </div>
          )}
          {dog.status === 'rejected' && dog.adminVerification?.rejectionReason && (
            <div className="bg-red-50 dark:bg-red-900/30 p-2 rounded mb-3">
              <p className="text-xs text-red-700 dark:text-red-300">
                <span className="font-semibold">Rejected:</span> {dog.adminVerification.rejectionReason}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onReview(dog)}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              View Details
            </button>
            {dog.status === 'approved' && (
              <button
                type="button"
                onClick={() => onSuspend(dog)}
                className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Suspend
              </button>
            )}
            {dog.status === 'suspended' && (
              <button
                type="button"
                onClick={() => onUnsuspend(dog.id)}
                className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Unsuspend
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Review Modal Component
const ReviewModal: React.FC<{
  dog: Dog;
  verificationNotes: string;
  setVerificationNotes: (notes: string) => void;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  suspensionReason: string;
  setSuspensionReason: (reason: string) => void;
  onApprove: (dogId: string) => void;
  onReject: (dogId: string) => void;
  onSuspend: (dogId: string) => void;
  onUnsuspend: (dogId: string) => void;
  onClose: () => void;
}> = ({
  dog,
  verificationNotes,
  setVerificationNotes,
  rejectionReason,
  setRejectionReason,
  suspensionReason,
  setSuspensionReason,
  onApprove,
  onReject,
  onSuspend,
  onUnsuspend,
  onClose,
}) => {
  const isPending = dog.status === 'pending';
  const isSuspended = dog.status === 'suspended';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white dark:bg-zinc-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Review {dog.name}
        </h2>

        {/* Dog Details Summary */}
        <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Breed</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{dog.breed}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Age</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{dog.age} years</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Gender</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{dog.gender}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100 capitalize">{dog.status}</p>
            </div>
          </div>
        </div>

        {/* Forms based on action */}
        {isPending && (
          <>
            {/* Verification Notes */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Verification Notes (Optional)
              </label>
              <textarea
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg"
                placeholder="Add any notes about this verification..."
              />
            </div>

            {/* Rejection Reason */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Rejection Reason (Required if rejecting)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg"
                placeholder="Explain why this dog cannot be approved..."
              />
            </div>

            {/* Action Buttons for Pending */}
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => onApprove(dog.id)}
                className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                ✅ Approve
              </button>
              <button
                type="button"
                onClick={() => onReject(dog.id)}
                className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                ❌ Reject
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 bg-zinc-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {/* Suspension Form */}
        {dog.status === 'approved' && (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Suspension Reason (Required)
              </label>
              <textarea
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg"
                placeholder="Explain why this dog is being suspended..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => onSuspend(dog.id)}
                className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
              >
                🚫 Suspend Dog
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 bg-zinc-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {/* Unsuspension */}
        {isSuspended && (
          <>
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Current Suspension Reason:</span> {dog.suspendedReason}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => onUnsuspend(dog.id)}
                className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                ✅ Unsuspend Dog
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 bg-zinc-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {/* View Only for Rejected */}
        {dog.status === 'rejected' && (
          <>
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">
                <span className="font-semibold">Rejection Reason:</span> {dog.adminVerification?.rejectionReason}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full px-4 py-3 bg-zinc-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors font-semibold"
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// Top Breeds Display Component
const TopBreedsDisplay: React.FC<{ dogs: Dog[] }> = ({ dogs }) => {
  const breedCounts = dogs.reduce((acc, dog) => {
    acc[dog.breed] = (acc[dog.breed] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedBreeds = Object.entries(breedCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  if (sortedBreeds.length === 0) {
    return <p className="text-gray-600 dark:text-gray-400">No breed data available</p>;
  }

  return (
    <div className="space-y-3">
      {sortedBreeds.map(([breed, count]) => (
        <div key={breed} className="flex justify-between items-center">
          <span className="text-gray-700 dark:text-gray-300">{breed}</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {count} {count === 1 ? 'dog' : 'dogs'}
          </span>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;