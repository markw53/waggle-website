// scripts/importBreeds.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

// Load environment variables
dotenv.config();

console.log('🔧 Initializing Firebase...');

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Validate config
if (!firebaseConfig.projectId) {
  console.error('❌ Firebase projectId is not set. Check your .env file.');
  throw new Error('Firebase configuration is incomplete');
}

console.log(`✅ Connected to project: ${firebaseConfig.projectId}\n`);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface BreedData {
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
  imageUrl?: string;
  officialLink?: string;
  kennelClubCategory?: string;
  size?: string;
  exerciseNeeds?: string;
  grooming?: string;
  temperament?: string;
  goodWithChildren?: string;
}

// Function to create a valid Firestore document ID
function createValidDocId(name: string): string {
  return name
    .toLowerCase()
    .trim()
    // Replace spaces and special characters with hyphens
    .replace(/[\s\W]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Ensure it's not empty
    || 'unknown-breed';
}

// Helper function to sanitize string values
function sanitizeString(value: string | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  // Remove any null characters or other problematic characters
  return value.replace(/\0/g, '').trim();
}

// Helper function to sanitize number values
function sanitizeNumber(value: number | string | null | undefined): number {
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : value;
  }
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

async function importBreeds() {
  console.log('🐕 Starting breed import from Kennel Club data...\n');
  
  try {
    // Read JSON file
    const jsonFile = fs.readFileSync('./kennel_club_breeds.json', 'utf8');
    const breeds = JSON.parse(jsonFile) as BreedData[];
    
    console.log(`📊 Found ${breeds.length} breeds to import\n`);
    
    let successCount = 0;
    let errorCount = 0;
    const failedBreeds: string[] = [];
    
    for (const breed of breeds) {
      if (!breed.name || breed.name.trim() === '') {
        console.log('⏭️  Skipping empty breed name');
        continue;
      }
      
      try {
        // Create URL-safe breed ID with better validation
        const breedId = createValidDocId(breed.name);
        
        // Validate the document ID
        if (!breedId || breedId === 'unknown-breed') {
          throw new Error(`Invalid document ID generated for breed: ${breed.name}`);
        }
        
        // Log the breed being processed
        console.log(`Processing: ${breed.name} -> ${breedId}`);
        
        // Create search keywords with sanitization
        const searchKeywords = [
          breed.name.toLowerCase(),
          breed.type?.toLowerCase() || '',
          breed.kennelClubCategory?.toLowerCase() || '',
          ...breed.name.toLowerCase().split(/[\s\W]+/),
        ]
          .filter(keyword => keyword && keyword.length > 0)
          .map(keyword => keyword.trim())
          .filter((keyword, index, self) => self.indexOf(keyword) === index); // Remove duplicates
        
        // Prepare breed data for Firestore with sanitization
        const breedData = {
          name: sanitizeString(breed.name),
          type: sanitizeString(breed.type) || 'Non-Sporting',
          height: sanitizeString(breed.height) || 'N/A',
          weight: sanitizeString(breed.weight) || 'N/A',
          color: sanitizeString(breed.color) || 'Various',
          popularity: sanitizeNumber(breed.popularity),
          intelligence: sanitizeNumber(breed.intelligence) || 50,
          longevity: sanitizeString(breed.longevity) || '10-14 years',
          healthProblems: sanitizeString(breed.healthProblems) || 'Varies by breed - consult veterinarian',
          yearlyExpenses: sanitizeNumber(breed.yearlyExpenses) || 1500,
          mealsPerDay: sanitizeNumber(breed.mealsPerDay) || 2,
          avgPuppyPrice: sanitizeNumber(breed.avgPuppyPrice) || 1000,
          
          // Kennel Club specific data
          imageUrl: sanitizeString(breed.imageUrl),
          officialLink: sanitizeString(breed.officialLink),
          kennelClubCategory: sanitizeString(breed.kennelClubCategory),
          size: sanitizeString(breed.size) || 'Medium',
          exerciseNeeds: sanitizeString(breed.exerciseNeeds),
          grooming: sanitizeString(breed.grooming),
          temperament: sanitizeString(breed.temperament),
          goodWithChildren: sanitizeString(breed.goodWithChildren),
          
          searchKeywords: searchKeywords
        };
        
        // Validate that we have essential fields
        if (!breedData.name || !breedData.type) {
          throw new Error(`Missing essential fields for breed: ${breed.name}`);
        }
        
        // Save to Firestore
        await setDoc(doc(db, 'breeds', breedId), breedData);
        
        successCount++;
        console.log(`✅ ${successCount}/${breeds.length}: ${breed.name}`);
        
      } catch (error: unknown) {
        errorCount++;
        failedBreeds.push(breed.name);
        console.error(`❌ Error importing ${breed.name}:`, error instanceof Error ? error.message : error);
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 Import Complete!');
    console.log('='.repeat(50));
    console.log(`✅ Successfully imported: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`📊 Total processed: ${breeds.length}`);
    
    if (failedBreeds.length > 0) {
      console.log('\n❌ Failed breeds:');
      failedBreeds.forEach(name => console.log(`   - ${name}`));
    }
    
    console.log('='.repeat(50) + '\n');
    
    process.exit(0);
  } catch (error: unknown) {
    console.error('❌ Fatal error during import:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run the import
importBreeds();