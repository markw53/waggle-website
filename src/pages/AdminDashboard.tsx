// src/pages/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, doc, updateDoc, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/context';
import type { Dog } from '@/types/dog';
import toast from 'react-hot-toast';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { ROUTES } from '@/config/routes';
import Admin2FASetup from '@/components/Admin2FASetup';
import { multiFactor } from 'firebase/auth';

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
  const is2FAEnabled = user && multiFactor(user).enrolledFactors.length > 0;
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
      navigate(ROUTES.HOME);
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
    {/* Header with Stats - Now with Background */}
    <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 sm:p-8 mb-8 border-2 border-zinc-200 dark:border-zinc-700 shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-[#573a1c] dark:text-amber-200 mb-2">
          🛡️ Admin Dashboard
        </h1>

        {/* 👇 Show 2FA setup if not enabled */}
        {!is2FAEnabled && (
          <div className="mb-8">
            <Admin2FASetup />
          </div>
        )}

        {/* Show enabled status badge if already set up */}
        {is2FAEnabled && (
          <div className="mb-8">
            <Admin2FASetup />
          </div>
        )}
        
        <p className="text-gray-600 dark:text-gray-400">
          Manage dog verifications and monitor platform activity
        </p>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border-2 border-zinc-200 dark:border-zinc-700 shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">Total Dogs</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-lg border-2 border-amber-200 dark:border-amber-800 shadow-sm">
          <p className="text-sm text-amber-800 dark:text-amber-400 mb-1 font-medium">Pending</p>
          <p className="text-3xl font-bold text-amber-900 dark:text-amber-200">{stats.pending}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border-2 border-green-200 dark:border-green-800 shadow-sm">
          <p className="text-sm text-green-800 dark:text-green-400 mb-1 font-medium">Approved</p>
          <p className="text-3xl font-bold text-green-900 dark:text-green-200">{stats.approved}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg border-2 border-red-200 dark:border-red-800 shadow-sm">
          <p className="text-sm text-red-800 dark:text-red-400 mb-1 font-medium">Rejected</p>
          <p className="text-3xl font-bold text-red-900 dark:text-red-200">{stats.rejected}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-800 shadow-sm">
          <p className="text-sm text-gray-800 dark:text-gray-400 mb-1 font-medium">Suspended</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-200">{stats.suspended}</p>
        </div>
      </div>
    </div>

    {/* Tabs */}
    <div className="bg-white dark:bg-zinc-800 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 overflow-hidden shadow-lg">
      <div className="border-b-2 border-zinc-200 dark:border-zinc-700">
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
        {/* ... rest of your tabs content stays the same ... */}
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
  <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 shadow-sm">
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
          <div className="w-48 h-48 rounded-lg bg-linear-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-600 flex items-center justify-center text-6xl border-2 border-zinc-300 dark:border-zinc-600">
            🐕
          </div>
        )}
      </div>

      {/* Dog Info */}
      <div className="flex-1 bg-white dark:bg-zinc-800 p-5 rounded-lg border border-zinc-200 dark:border-zinc-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {dog.name}
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4 font-medium">
          {dog.breed} • {dog.age} years • {dog.gender}
        </p>

        {/* Eligibility Status */}
        {dog.breedingEligibility ? (
          <div
            className={`inline-block px-4 py-2 rounded-lg mb-4 font-semibold ${
              dog.breedingEligibility.isEligible
                ? 'bg-green-100 dark:bg-green-900/40 text-green-900 dark:text-green-200 border border-green-300 dark:border-green-700'
                : 'bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
            }`}
          >
            {dog.breedingEligibility.isEligible
              ? '✅ Meets Basic Requirements'
              : `⚠️ ${dog.breedingEligibility.reasonIfIneligible}`}
          </div>
        ) : (
          <div className="inline-block px-4 py-2 rounded-lg mb-4 font-semibold bg-gray-100 dark:bg-gray-900/40 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-700">
            ℹ️ Legacy Entry - Eligibility Not Set
          </div>
        )}

        {/* Health Info Summary */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-zinc-100 dark:bg-zinc-700/70 p-3 rounded-lg border border-zinc-200 dark:border-zinc-600">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">Vet Verified</p>
            <p className="font-bold text-gray-900 dark:text-gray-100">
              {dog.healthInfo.vetVerified ? '✅ Yes' : '❌ No'}
            </p>
          </div>
          <div className="bg-zinc-100 dark:bg-zinc-700/70 p-3 rounded-lg border border-zinc-200 dark:border-zinc-600">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">Brucellosis</p>
            <p className="font-bold text-gray-900 dark:text-gray-100">
              {dog.healthInfo.brucellosisTest ? '✅ Negative' : '❌ Not Tested'}
            </p>
          </div>
          <div className="bg-zinc-100 dark:bg-zinc-700/70 p-3 rounded-lg border border-zinc-200 dark:border-zinc-600">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">Vaccinations</p>
            <p className="font-bold text-gray-900 dark:text-gray-100">
              {dog.healthInfo.vaccinationUpToDate ? '✅ Current' : '❌ Outdated'}
            </p>
          </div>
          <div className="bg-zinc-100 dark:bg-zinc-700/70 p-3 rounded-lg border border-zinc-200 dark:border-zinc-600">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">Genetic Testing</p>
            <p className="font-bold text-gray-900 dark:text-gray-100">
              {dog.healthInfo.geneticTestingDone ? '✅ Done' : '⚠️ Not Done'}
            </p>
          </div>
        </div>

        {/* Documents */}
        {(dog.healthInfo.vetCertificateUrl || dog.healthInfo.vaccinationRecordUrl) && (
          <div className="mb-4 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
              <span>📄</span> Documents
            </h3>
            <div className="space-y-2">
              {dog.healthInfo.vetCertificateUrl && (
                <a
                  href={dog.healthInfo.vetCertificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-700 dark:text-blue-300 hover:underline font-medium"
                >
                  📄 Veterinary Certificate
                </a>
              )}
              {dog.healthInfo.vaccinationRecordUrl && (
                <a
                  href={dog.healthInfo.vaccinationRecordUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-700 dark:text-blue-300 hover:underline font-medium"
                >
                  💉 Vaccination Record
                </a>
              )}
            </div>
          </div>
        )}

        {/* Veterinarian Info */}
        {dog.healthInfo.vetName && (
          <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg mb-4 border border-indigo-200 dark:border-indigo-800">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
              <span>👨‍⚕️</span> Veterinarian Contact
            </h3>
            <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
              <span className="font-bold">Name:</span> {dog.healthInfo.vetName}
            </p>
            {dog.healthInfo.vetPhone && (
              <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                <span className="font-bold">Phone:</span> {dog.healthInfo.vetPhone}
              </p>
            )}
          </div>
        )}

        {/* Action Button */}
        <button
          type="button"
          onClick={() => onReview(dog)}
          className="w-full px-4 py-3 bg-[#8c5628] dark:bg-amber-700 text-white rounded-lg hover:bg-[#6d4320] dark:hover:bg-amber-600 transition-colors font-semibold shadow-md"
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
  const getStatusBadge = (status?: string) => {
    const safeStatus = status || 'pending';
    
    const badges = {
      pending: 'bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 border-2 border-amber-300 dark:border-amber-700',
      approved: 'bg-green-100 dark:bg-green-900/40 text-green-900 dark:text-green-200 border-2 border-green-300 dark:border-green-700',
      rejected: 'bg-red-100 dark:bg-red-900/40 text-red-900 dark:text-red-200 border-2 border-red-300 dark:border-red-700',
      suspended: 'bg-gray-100 dark:bg-gray-900/40 text-gray-900 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-700',
    };
    return badges[safeStatus as keyof typeof badges] || badges.pending;
  };

  const getStatusLabel = (status?: string) => {
    const safeStatus = status || 'pending';
    return safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1);
  };

  return (
    <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border-2 border-zinc-200 dark:border-zinc-700 shadow-sm">
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
            <div className="w-20 h-20 rounded-lg bg-linear-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-600 flex items-center justify-center text-3xl border-2 border-zinc-300 dark:border-zinc-600">
              🐕
            </div>
          )}
        </div>

        {/* Dog Info */}
        <div className="flex-1 min-w-0 bg-white dark:bg-zinc-800 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {dog.name}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                {dog.breed} • {dog.age} years • {dog.gender}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${getStatusBadge(dog.status)}`}>
              {getStatusLabel(dog.status)}
            </span>
          </div>

          {/* ID */}
          <div className="bg-zinc-100 dark:bg-zinc-700/70 px-3 py-2 rounded mb-3 border border-zinc-200 dark:border-zinc-600">
            <p className="text-xs text-gray-700 dark:text-gray-300 font-mono font-semibold">
              ID: {dog.id}
            </p>
          </div>

          {/* Suspension/Rejection Reason */}
          {dog.status === 'suspended' && dog.suspendedReason && (
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded mb-3 border-2 border-gray-300 dark:border-gray-600">
              <p className="text-xs text-gray-900 dark:text-gray-100 font-medium">
                <span className="font-bold">⛔ Suspended:</span> {dog.suspendedReason}
              </p>
            </div>
          )}
          {dog.status === 'rejected' && dog.adminVerification?.rejectionReason && (
            <div className="bg-red-100 dark:bg-red-900/40 p-3 rounded mb-3 border-2 border-red-300 dark:border-red-700">
              <p className="text-xs text-red-900 dark:text-red-200 font-medium">
                <span className="font-bold">❌ Rejected:</span> {dog.adminVerification.rejectionReason}
              </p>
            </div>
          )}

          {/* Warning for dogs without status */}
          {!dog.status && (
            <div className="bg-amber-100 dark:bg-amber-900/40 p-3 rounded mb-3 border-2 border-amber-300 dark:border-amber-700">
              <p className="text-xs text-amber-900 dark:text-amber-200 font-medium">
                <span className="font-bold">⚠️ Legacy Entry:</span> This dog was created before status tracking.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onReview(dog)}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-sm"
            >
              View Details
            </button>
            {dog.status === 'approved' && (
              <button
                type="button"
                onClick={() => onSuspend(dog)}
                className="px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold shadow-sm"
              >
                Suspend
              </button>
            )}
            {dog.status === 'suspended' && (
              <button
                type="button"
                onClick={() => onUnsuspend(dog.id)}
                className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-sm"
              >
                Unsuspend
              </button>
            )}
            {!dog.status && (
              <button
                type="button"
                onClick={() => onReview(dog)}
                className="px-3 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold shadow-sm"
              >
                Review & Update
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
  const isPending = dog.status === 'pending' || !dog.status;
  const isSuspended = dog.status === 'suspended';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white dark:bg-zinc-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border-2 border-zinc-300 dark:border-zinc-600 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Review {dog.name}
        </h2>

        {/* Dog Details Summary */}
        <div className="mb-6 p-5 bg-zinc-100 dark:bg-zinc-700/70 rounded-lg border-2 border-zinc-200 dark:border-zinc-600">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">Breed</p>
              <p className="font-bold text-gray-900 dark:text-gray-100">{dog.breed}</p>
            </div>
            <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">Age</p>
              <p className="font-bold text-gray-900 dark:text-gray-100">{dog.age} years</p>
            </div>
            <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">Gender</p>
              <p className="font-bold text-gray-900 dark:text-gray-100">{dog.gender}</p>
            </div>
            <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">Status</p>
              <p className="font-bold text-gray-900 dark:text-gray-100 capitalize">{dog.status || 'pending'}</p>
            </div>
          </div>
        </div>

        {/* Forms based on action */}
        {isPending && (
          <>
            {/* Verification Notes */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
                Verification Notes (Optional)
              </label>
              <textarea
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border-2 border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg font-medium focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500"
                placeholder="Add any notes about this verification..."
              />
            </div>

            {/* Rejection Reason */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
                Rejection Reason (Required if rejecting)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border-2 border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg font-medium focus:ring-2 focus:ring-red-500"
                placeholder="Explain why this dog cannot be approved..."
              />
            </div>

            {/* Action Buttons for Pending */}
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => onApprove(dog.id)}
                className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold shadow-md"
              >
                ✅ Approve
              </button>
              <button
                type="button"
                onClick={() => onReject(dog.id)}
                className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold shadow-md"
              >
                ❌ Reject
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 bg-zinc-300 dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-zinc-400 dark:hover:bg-zinc-600 transition-colors font-bold shadow-md"
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
              <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
                Suspension Reason (Required)
              </label>
              <textarea
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border-2 border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg font-medium focus:ring-2 focus:ring-gray-500"
                placeholder="Explain why this dog is being suspended..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => onSuspend(dog.id)}
                className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-bold shadow-md"
              >
                🚫 Suspend Dog
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 bg-zinc-300 dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-zinc-400 dark:hover:bg-zinc-600 transition-colors font-bold shadow-md"
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {/* Unsuspension */}
        {isSuspended && (
          <>
            <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-600">
              <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                <span className="font-bold">⛔ Current Suspension Reason:</span> {dog.suspendedReason}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => onUnsuspend(dog.id)}
                className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold shadow-md"
              >
                ✅ Unsuspend Dog
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 bg-zinc-300 dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-zinc-400 dark:hover:bg-zinc-600 transition-colors font-bold shadow-md"
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {/* View Only for Rejected */}
        {dog.status === 'rejected' && (
          <>
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/40 rounded-lg border-2 border-red-300 dark:border-red-700">
              <p className="text-sm text-red-900 dark:text-red-200 font-medium">
                <span className="font-bold">❌ Rejection Reason:</span> {dog.adminVerification?.rejectionReason}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full px-4 py-3 bg-zinc-300 dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-zinc-400 dark:hover:bg-zinc-600 transition-colors font-bold shadow-md"
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
    return (
      <div className="text-center py-8 bg-zinc-100 dark:bg-zinc-700/50 rounded-lg border border-zinc-200 dark:border-zinc-600">
        <p className="text-gray-600 dark:text-gray-400 font-medium">No breed data available</p>
      </div>
    );
  }

  const maxCount = sortedBreeds[0][1];

  return (
    <div className="space-y-3">
      {sortedBreeds.map(([breed, count], index) => {
        const percentage = (count / maxCount) * 100;
        return (
          <div key={breed} className="bg-white dark:bg-zinc-800 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-gray-500 dark:text-gray-400">
                  #{index + 1}
                </span>
                <span className="text-gray-900 dark:text-gray-100 font-semibold">
                  {breed}
                </span>
              </div>
              <span className="font-bold text-gray-900 dark:text-gray-100 bg-zinc-100 dark:bg-zinc-700 px-3 py-1 rounded-lg">
                {count} {count === 1 ? 'dog' : 'dogs'}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2.5">
              <div
                className="bg-linear-to-r from-[#8c5628] to-amber-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminDashboard;