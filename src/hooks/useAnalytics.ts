// src/hooks/useAnalytics.ts
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import type { AnalyticsData, ActivityLog } from '@/types/analytics';

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentActivity ] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Fetch all collections
        const [usersSnap, dogsSnap, matchesSnap, conversationsSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'dogs')),
          getDocs(collection(db, 'matches')),
          getDocs(collection(db, 'conversations')),
        ]);

        // Calculate totals
        const totalUsers = usersSnap.size;
        const totalDogs = dogsSnap.size;
        const totalMatches = matchesSnap.size;
        const totalMessages = conversationsSnap.size;

        // Calculate new items this week
        let newUsersThisWeek = 0;
        let newDogsThisWeek = 0;
        let newMatchesThisWeek = 0;

        usersSnap.forEach(doc => {
          const data = doc.data();
          if (data.createdAt?.toDate() >= oneWeekAgo) newUsersThisWeek++;
        });

        dogsSnap.forEach(doc => {
          const data = doc.data();
          if (data.createdAt?.toDate() >= oneWeekAgo) newDogsThisWeek++;
        });

        matchesSnap.forEach(doc => {
          const data = doc.data();
          if (data.createdAt?.toDate() >= oneWeekAgo) newMatchesThisWeek++;
        });

        // Calculate active conversations (messages in last 7 days)
        let activeConversations = 0;
        conversationsSnap.forEach(doc => {
          const data = doc.data();
          if (data.lastMessageAt?.toDate() >= oneWeekAgo) activeConversations++;
        });

        // Dogs by breed
        const breedMap = new Map<string, number>();
        dogsSnap.forEach(doc => {
          const breed = doc.data().breed;
          breedMap.set(breed, (breedMap.get(breed) || 0) + 1);
        });
        const dogsByBreed = Array.from(breedMap.entries())
          .map(([breed, count]) => ({ breed, count }))
          .sort((a, b) => b.count - a.count);

        // Dogs by gender
        const genderMap = new Map<string, number>();
        dogsSnap.forEach(doc => {
          const gender = doc.data().gender;
          genderMap.set(gender, (genderMap.get(gender) || 0) + 1);
        });
        const dogsByGender = Array.from(genderMap.entries())
          .map(([gender, count]) => ({ gender, count }));

        // User growth (last 30 days)
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const dateMap = new Map<string, number>();
        
        usersSnap.forEach(doc => {
          const data = doc.data();
          const createdAt = data.createdAt?.toDate();
          if (createdAt && createdAt >= thirtyDaysAgo) {
            const dateStr = createdAt.toLocaleDateString();
            dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + 1);
          }
        });

        const userGrowth = Array.from(dateMap.entries())
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Popular breeds (top 10)
        const popularBreeds = dogsByBreed.slice(0, 10);

        setAnalytics({
          totalUsers,
          totalDogs,
          totalMatches,
          totalMessages,
          newUsersThisWeek,
          newDogsThisWeek,
          newMatchesThisWeek,
          activeConversations,
          dogsByBreed,
          dogsByGender,
          userGrowth,
          popularBreeds,
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return { analytics, recentActivity, loading };
}