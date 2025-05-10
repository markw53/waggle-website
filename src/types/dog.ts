// src/types/dog.ts
export interface Dog {
  id?: string; // Firestore doc id
  ownerId: string;
  name: string;
  breed: string;
  age: number;
  gender: 'male' | 'female';
  photos: string[];
  description?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
  traits: {
    size: 'small' | 'medium' | 'large';
    energy: 'low' | 'medium' | 'high';
    friendliness: 'low' | 'medium' | 'high';
  };
  medicalInfo: {
    vaccinated: boolean;
    neutered: boolean;
    lastCheckup: Date;
  };
}