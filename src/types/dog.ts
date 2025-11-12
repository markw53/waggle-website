// src/types/dog.ts
import { Timestamp } from 'firebase/firestore';

export interface Location {
  lat: number;
  lng: number;
  city?: string;
  county?: string;
  postcode?: string;
  country?: string;
}

// ✅ NEW: Kennel Club Info interface
export interface KennelClubInfo {
  registrationNumber?: string;
  registeredName?: string;
  breedRegistered?: string;
  dateRegistered?: Timestamp;
  registrationVerified?: boolean;
  registrationDocumentUrl?: string;
  verifiedBy?: string; // Admin user ID who verified
  verifiedAt?: Timestamp;
}

export interface Dog {
  id: string;
  name: string;
  breed: string;
  age: number;
  gender: 'Male' | 'Female';
  ownerId: string;
  imageUrl?: string;
  bio?: string;
  location?: Location; 
  createdAt: Timestamp;
  
  // ✅ ADD THIS
  kennelClubInfo?: KennelClubInfo;
  
  // Health & Verification Fields
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
    geneticTestResults?: string[];
    
    // Vaccination
    vaccinationUpToDate: boolean;
    vaccinationRecordUrl?: string;
    
    // Other health checks
    brucellosisTest: boolean;
    brucellosisTestDate?: Timestamp;
    
    // Breeding restrictions
    hasHereditaryConditions: boolean;
    hereditaryConditionsDetails?: string;
  };
  
  // Breeding eligibility
  breedingEligibility: {
    isEligible: boolean;
    reasonIfIneligible?: string;
    minimumAgeMet: boolean;
    maximumAgeMet: boolean;
    numberOfLitters?: number;
    lastLitterDate?: Timestamp;
    
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
    pedigree?: string;
    ownership?: string;
    microchipNumber?: string;
    registrationPapers?: string;
  };
  
  // Admin verification
  adminVerification: {
    verified: boolean;
    verifiedBy?: string;
    verifiedAt?: Timestamp;
    verificationNotes?: string;
    rejectionReason?: string;
  };
  
  // Status
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  suspendedReason?: string;
}