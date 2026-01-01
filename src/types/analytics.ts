import { Timestamp } from 'firebase/firestore';

export interface AnalyticsData {
  totalUsers: number;
  totalDogs: number;
  totalMatches: number;
  totalMessages: number;
  newUsersThisWeek: number;
  newDogsThisWeek: number;
  newMatchesThisWeek: number;
  activeConversations: number;
  dogsByBreed: { breed: string; count: number }[];
  dogsByGender: { gender: string; count: number }[];
  userGrowth: { date: string; count: number }[];
  popularBreeds: { breed: string; count: number }[];
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: Timestamp;
}