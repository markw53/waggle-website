// src/types/dog.ts
import { Timestamp } from 'firebase/firestore';

export interface Dog {
  id: string; // Firestore doc id
  ownerId: string;
  name: string;
  breed: string;
  age: number;
  gender: 'Male' | 'Female'; // Capitalized to match your database
  bio: string;
  imageUrl: string | null; // Single image URL or null
  createdAt: Timestamp; // Firebase Timestamp, not Date
}

// Optional: If you want to add these features later
export interface DogExtended extends Dog {
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  traits?: {
    size: 'small' | 'medium' | 'large';
    energy: 'low' | 'medium' | 'high';
    friendliness: 'low' | 'medium' | 'high';
    trainability?: 'low' | 'medium' | 'high';
  };
  medicalInfo?: {
    vaccinated: boolean;
    neutered: boolean;
    lastCheckup?: Date;
    notes?: string;
  };
  photos?: string[]; // Multiple photos if you want to add this feature
}