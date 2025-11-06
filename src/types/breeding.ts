import { Timestamp } from 'firebase/firestore';

export interface BreedingSchedule {
  id: string;
  dogId: string;
  ownerId: string;
  cycleStartDate: Timestamp;
  cycleEndDate: Timestamp;
  optimalBreedingStart: Timestamp;
  optimalBreedingEnd: Timestamp;
  notes?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: BreedingSchedule;
  type: 'heat-cycle' | 'optimal-window' | 'match';
}