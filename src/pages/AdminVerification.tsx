// src/pages/AdminVerification.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/context';
import type { Dog } from '@/types/dog';
import toast from 'react-hot-toast';
import { useIsAdmin } from '@/hooks/useIsAdmin';

const AdminVerification: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [pendingDogs, setPendingDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // TODO: Add admin role check here
  // For now, we'll assume any logged-in user can access this
  // In production, check if user has admin role in Firestore

   useEffect(() => {
    if (!user || (!adminLoading && !isAdmin)) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }

    if (!adminLoading && isAdmin) {
      fetchPendingDogs();
    }
  }, [user, isAdmin, adminLoading, navigate]);

  if (adminLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#8c5628] dark:border-amber-500 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const fetchPendingDogs = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'dogs'),
        where('status', '==', 'pending')
      );
      
      const snapshot = await getDocs(q);
      const dogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Dog[];
      
      setPendingDogs(dogs);
    } catch (error) {
      console.error('Error fetching pending dogs:', error);
      toast.error('Failed to load pending verifications');
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
      fetchPendingDogs();
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
      fetchPendingDogs();
      setSelectedDog(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting dog:', error);
      toast.error('Failed to reject dog');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#8c5628] dark:border-amber-500 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading verifications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto my-10 p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#573a1c] dark:text-amber-200 mb-2">
          🔍 Dog Verification Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Review and approve dogs for breeding registration
        </p>
      </div>

      {pendingDogs.length === 0 ? (
        <div className="bg-white dark:bg-zinc-800 p-12 rounded-xl text-center">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            All Caught Up!
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No pending verifications at the moment
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {pendingDogs.map((dog) => (
            <div
              key={dog.id}
              className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700"
            >
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

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setSelectedDog(dog)}
                      className="flex-1 px-4 py-2 bg-[#8c5628] dark:bg-amber-700 text-white rounded-lg hover:bg-[#6d4320] dark:hover:bg-amber-600 transition-colors font-semibold"
                    >
                      Review Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedDog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Review {selectedDog.name}
            </h2>

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

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => handleApprove(selectedDog.id)}
                className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                ✅ Approve
              </button>
              <button
                type="button"
                onClick={() => handleReject(selectedDog.id)}
                className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                ❌ Reject
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedDog(null);
                  setVerificationNotes('');
                  setRejectionReason('');
                }}
                className="px-4 py-3 bg-zinc-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVerification;