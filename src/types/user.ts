// src/types/user.ts
import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  bio?: string;
  location?: string;
  phoneNumber?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}