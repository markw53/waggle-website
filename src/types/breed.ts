export interface BreedInfo {
  id: string;
  name: string;
  type: 'Sporting' | 'Hound' | 'Working' | 'Terrier' | 'Toy' | 'Non-Sporting' | 'Herding';
  height: string;
  weight: string;
  color: string;
  popularity: number;
  intelligence: number;
  longevity: string;
  healthProblems: string;
  
  yearlyExpenses?: number;
  mealsPerDay?: number;
  avgPuppyPrice?: number;
  searchKeywords?: string[];
  
  // Kennel Club Data
  imageUrl?: string;
  officialLink?: string;
  kennelClubCategory?: string;
  size?: 'Small' | 'Medium' | 'Large' | 'Giant';
  exerciseNeeds?: string;
  grooming?: string;
  temperament?: string;
  goodWithChildren?: string;
}