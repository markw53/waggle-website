// src/types/breed.ts
export interface BreedInfo {
  id: string;
  name: string;
  type: string;
  height: string;
  weight: string;
  color: string;
  popularity: number;
  intelligence: number;
  longevity: string;
  healthProblems: string;
  yearlyExpenses: number;
  mealsPerDay: number;
  avgPuppyPrice: number;
  searchKeywords?: string[];
}