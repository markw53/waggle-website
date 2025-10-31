// src/types/dog.ts
import { Timestamp } from 'firebase/firestore';

export interface Dog {
  id: string;
  name: string;
  breed: string;
  age: number;
  gender: 'Male' | 'Female';
  imageUrl?: string;
  bio?: string;
  ownerId: string;
  createdAt: Timestamp;
  
  // ✅ Health & Verification Fields
  healthInfo: {
    vetVerified: boolean;
    vetCertificateUrl?: string;
    vetName?: string;
    vetPhone?: string;
    lastCheckupDate?: Timestamp;
    
    // Health clearances
    hipsDysplasiaCleared: boolean;
    elbowDysplasiaCleared: boolean;
    eyesCleared: boolean;
    heartCleared: boolean;
    
    // Genetic testing
    geneticTestingDone: boolean;
    geneticTestResults?: string[]; // Array of cleared conditions
    
    // Vaccination
    vaccinationUpToDate: boolean;
    vaccinationRecordUrl?: string;
    
    // Other health checks
    brucellosisTest: boolean; // Critical for breeding
    brucellosisTestDate?: Timestamp;
    
    // Breeding restrictions
    hasHereditaryConditions: boolean;
    hereditaryConditionsDetails?: string;
  };
  
  // Breeding eligibility
  breedingEligibility: {
    isEligible: boolean;
    reasonIfIneligible?: string;
    minimumAgeMet: boolean; // Must be at least 2 years old
    maximumAgeMet: boolean; // Should not be too old
    numberOfLitters?: number; // Track previous litters
    lastLitterDate?: Timestamp;
    
    // Professional verification
    breedingLicenseNumber?: string;
    kennelClubRegistration?: string;
  };
  
  // Temperament & behavior
  temperament: {
    aggressionIssues: boolean;
    anxietyIssues: boolean;
    trainable: boolean;
    goodWithOtherDogs: boolean;
    behaviorCertificateUrl?: string;
  };
  
  // Documents
  documents: {
    pedigree?: string; // URL to pedigree certificate
    ownership?: string; // Proof of ownership
    microchipNumber?: string;
    registrationPapers?: string;
  };
  
  // Admin verification
  adminVerification: {
    verified: boolean;
    verifiedBy?: string; // Admin user ID
    verifiedAt?: Timestamp;
    verificationNotes?: string;
    rejectionReason?: string;
  };
  
  // Status
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  suspendedReason?: string;
}