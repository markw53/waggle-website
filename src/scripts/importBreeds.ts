// scripts/importBreeds.ts
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import * as fs from 'fs';
import type { BreedInfo } from '@/types/breed';

interface CSVBreed {
  name: string;
  type: string;
  height: string;
  weight: string;
  color: string;
  popularity: string;
  intelligence: string;
  longevity: string;
  healthProblems: string;
  yearlyExpenses: string;
  mealsPerDay: string;
  avgPuppyPrice: string;
  imageUrl: string;
  officialLink: string;
  kennelClubCategory: string;
  size: string;
  exerciseNeeds: string;
  grooming: string;
  temperament: string;
  goodWithChildren: string;
}

async function importBreeds() {
  console.log('🐕 Starting breed import from Kennel Club data...\n');
  
  // Read JSON file (easier than CSV for this use case)
  const jsonFile = fs.readFileSync('./kennel_club_breeds.json', 'utf8');
  const breeds = JSON.parse(jsonFile) as CSVBreed[];
  
  console.log(`📊 Found ${breeds.length} breeds to import\n`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const breed of breeds) {
    if (!breed.name || breed.name.trim() === '') {
      console.log('⏭️  Skipping empty breed name');
      continue;
    }
    
    try {
      // Create URL-safe breed ID
      const breedId = breed.name.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      
      // Prepare breed data for Firestore
      const breedData: Omit<BreedInfo, 'id'> = {
        name: breed.name.trim(),
        type: breed.type as BreedInfo['type'],
        height: breed.height || 'N/A',
        weight: breed.weight || 'N/A',
        color: breed.color || 'Various',
        popularity: parseInt(breed.popularity as string) || 0,
        intelligence: parseInt(breed.intelligence as string) || 50,
        longevity: breed.longevity || '10-14 years',
        healthProblems: breed.healthProblems || 'Varies by breed',
        yearlyExpenses: parseFloat(breed.yearlyExpenses as string) || 1500,
        mealsPerDay: parseFloat(breed.mealsPerDay as string) || 2,
        avgPuppyPrice: parseFloat(breed.avgPuppyPrice as string) || 1000,
        
        // Kennel Club specific data
        imageUrl: breed.imageUrl?.trim() || '',
        officialLink: breed.officialLink?.trim() || '',
        kennelClubCategory: breed.kennelClubCategory?.trim() || '',
        size: breed.size as BreedInfo['size'] || 'Medium',
        exerciseNeeds: breed.exerciseNeeds?.trim() || '',
        grooming: breed.grooming?.trim() || '',
        temperament: breed.temperament?.trim() || '',
        goodWithChildren: breed.goodWithChildren?.trim() || '',
        
        searchKeywords: [
          breed.name.toLowerCase(),
          breed.type?.toLowerCase() || '',
          breed.kennelClubCategory?.toLowerCase() || '',
          ...breed.name.toLowerCase().split(' '),
          ...(breed.temperament?.toLowerCase().split(',') || [])
        ].filter(Boolean).map(k => k.trim())
      };
      
      // Save to Firestore
      await setDoc(doc(db, 'breeds', breedId), breedData);
      
      successCount++;
      console.log(`✅ ${successCount}/${breeds.length}: ${breed.name}`);
      
    } catch (error: unknown) {
      errorCount++;
      console.error(`❌ Error importing ${breed.name}:`, error);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🎉 Import Complete!');
  console.log('='.repeat(50));
  console.log(`✅ Successfully imported: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`📊 Total processed: ${breeds.length}`);
  console.log('='.repeat(50) + '\n');
}

// Run the import
importBreeds().catch((error: unknown) => {
  console.error('❌ Fatal error during import:', error);
  process.exit(1);
});