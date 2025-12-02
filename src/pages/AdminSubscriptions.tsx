// src/pages/AdminSubscriptions.tsx
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import type { Subscription } from '@/types/subscription';
import toast from 'react-hot-toast';

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<(Subscription & { id: string; email?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const subsSnapshot = await getDocs(collection(db, 'subscriptions'));
        const usersSnapshot = await getDocs(collection(db, 'users'));
        
        const userEmails: Record<string, string> = {};
        usersSnapshot.docs.forEach(doc => {
          userEmails[doc.id] = doc.data().email || 'Unknown';
        });

        const subsData = subsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          email: userEmails[doc.id]
        })) as (Subscription & { id: string; email?: string })[];

        setSubscriptions(subsData);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load subscriptions');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const updateSubscription = async (
    userId: string, 
    tier: 'free' | 'standard' | 'premium'
  ) => {
    try {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      await updateDoc(doc(db, 'subscriptions', userId), {
        tier,
        status: 'active',
        currentPeriodEnd: Timestamp.fromDate(endDate),
        updatedAt: Timestamp.now()
      });

      toast.success(`Updated to ${tier}`);
      
      // Refresh list
      setSubscriptions(prev =>
        prev.map(sub =>
          sub.id === userId ? { ...sub, tier, status: 'active' } : sub
        )
      );
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update subscription');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Subscription Management</h1>

      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-zinc-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                User Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Current Tier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
            {subscriptions.map((sub) => (
              <tr key={sub.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {sub.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    sub.tier === 'premium' 
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                      : sub.tier === 'standard'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                  }`}>
                    {sub.tier?.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {sub.status}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  {sub.tier !== 'standard' && (
                    <button
                      onClick={() => updateSubscription(sub.id, 'standard')}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      → Standard
                    </button>
                  )}
                  {sub.tier !== 'premium' && (
                    <button
                      onClick={() => updateSubscription(sub.id, 'premium')}
                      className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
                    >
                      → Premium
                    </button>
                  )}
                  {sub.tier !== 'free' && (
                    <button
                      onClick={() => updateSubscription(sub.id, 'free')}
                      className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      → Free
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}