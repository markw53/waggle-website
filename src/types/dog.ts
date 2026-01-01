import { Timestamp } from 'firebase/firestore';

export interface Location {
  lat: number;
  lng: number;
  city?: string;
  county?: string;
  postcode?: string;
  country?: string;
}
export interface KennelClubInfo {
  registrationNumber?: string;
  registeredName?: string;
  breedRegistered?: string;
  dateRegistered?: Timestamp;
  registrationVerified?: boolean;
  registrationDocumentUrl?: string;
  verifiedBy?: string; 
  verifiedAt?: Timestamp;
}

export interface Dog {
  id: string;
  name: string;
  breed: string;
  age: number;
  gender: 'Male' | 'Female';
  color?: string;
  ownerId: string;
  imageUrl?: string;
  bio?: string;
  location?: Location; 
  createdAt: Timestamp;
  
  kennelClubInfo?: KennelClubInfo;
  
    healthInfo: {
    vetVerified: boolean;
    vetCertificateUrl?: string;
    vetName?: string;
    vetPhone?: string;
    lastCheckupDate?: Timestamp;
    
    hipsDysplasiaCleared: boolean;
    elbowDysplasiaCleared: boolean;
    eyesCleared: boolean;
    heartCleared: boolean;
    
    geneticTestingDone: boolean;
    geneticTestResults?: string[];
    
    vaccinationUpToDate: boolean;
    vaccinationRecordUrl?: string;
    
    brucellosisTest: boolean;
    brucellosisTestDate?: Timestamp;
    
    hasHereditaryConditions: boolean;
    hereditaryConditionsDetails?: string;
  };
  
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
  
  temperament: {
    aggressionIssues: boolean;
    anxietyIssues: boolean;
    trainable: boolean;
    goodWithOtherDogs: boolean;
    behaviorCertificateUrl?: string;
  };
  
  documents: {
    pedigree?: string;
    ownership?: string;
    microchipNumber?: string;
    registrationPapers?: string;
  };
  
  adminVerification: {
    verified: boolean;
    verifiedBy?: string;
    verifiedAt?: Timestamp;
    verificationNotes?: string;
    rejectionReason?: string;
  };
  
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  suspendedReason?: string;
}