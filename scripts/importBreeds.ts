// scripts/importBreeds.ts
import { db } from './firebase-admin.ts';
import * as fs from 'fs';

interface BreedData {
  name: string;
  type: string;
  height: string;
  weight: string;
  color: string;
  longevity: string;
  healthProblems: string;
  imageUrl?: string;
  officialLink?: string;
  kennelClubCategory?: string;
  size?: string;
  exerciseNeeds?: string;
  grooming?: string;
  temperament?: string;
  goodWithChildren?: string;
}

interface FirestoreBreedData {
  name: string;
  type: string;
  height: string;
  weight: string;
  color: string;
  longevity: string;
  healthProblems: string;
  searchKeywords: string[];
  imageUrl?: string;
  officialLink?: string;
  kennelClubCategory?: string;
  size?: string;
  exerciseNeeds?: string;
  grooming?: string;
  temperament?: string;
  goodWithChildren?: string;
}

function createValidDocId(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[\s\W]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'unknown-breed';
}

function sanitizeString(value: string | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  return value.replace(/\0/g, '').trim();
}

async function importBreeds() {
  console.log('🐕 Starting breed import from Kennel Club data...\n');
  
  try {
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
        const breedId = createValidDocId(breed.name);
        
        if (!breedId || breedId === 'unknown-breed') {
          throw new Error(`Invalid document ID generated for breed: ${breed.name}`);
        }
        
        console.log(`Processing: ${breed.name} -> ${breedId} [${breed.type}]`);
        
        // Create search keywords
        const searchKeywords = [
          breed.name.toLowerCase(),
          breed.type?.toLowerCase() || '',
          breed.kennelClubCategory?.toLowerCase() || '',
          ...breed.name.toLowerCase().split(/[\s\W]+/),
        ]
          .filter(keyword => keyword && keyword.length > 0)
          .map(keyword => keyword.trim())
          .filter((keyword, index, self) => self.indexOf(keyword) === index);
        
        // Build the breed data object with required fields
        const breedData: FirestoreBreedData = {
          name: sanitizeString(breed.name),
          type: sanitizeString(breed.type) || 'Non-Sporting',
          height: sanitizeString(breed.height) || 'N/A',
          weight: sanitizeString(breed.weight) || 'N/A',
          color: sanitizeString(breed.color) || 'Various',
          longevity: sanitizeString(breed.longevity) || '10-14 years',
          healthProblems: sanitizeString(breed.healthProblems),
          searchKeywords: searchKeywords
        };
        
        // Add optional fields only if they have values
        if (breed.imageUrl) {
          breedData.imageUrl = sanitizeString(breed.imageUrl);
        }
        if (breed.officialLink) {
          breedData.officialLink = sanitizeString(breed.officialLink);
        }
        if (breed.kennelClubCategory) {
          breedData.kennelClubCategory = sanitizeString(breed.kennelClubCategory);
        }
        if (breed.size) {
          breedData.size = sanitizeString(breed.size);
        }
        if (breed.exerciseNeeds) {
          breedData.exerciseNeeds = sanitizeString(breed.exerciseNeeds);
        }
        if (breed.grooming) {
          breedData.grooming = sanitizeString(breed.grooming);
        }
        if (breed.temperament) {
          breedData.temperament = sanitizeString(breed.temperament);
        }
        if (breed.goodWithChildren) {
          breedData.goodWithChildren = sanitizeString(breed.goodWithChildren);
        }
        
        if (!breedData.name || !breedData.type) {
          throw new Error(`Missing essential fields for breed: ${breed.name}`);
        }
        
        await db.collection('breeds').doc(breedId).set(breedData);
        
        successCount++;
        console.log(`✅ ${successCount}/${breeds.length}: ${breed.name}`);
        
      } catch (err) {
        errorCount++;
        failedBreeds.push(breed.name);
        console.error(`❌ Error importing ${breed.name}:`, err instanceof Error ? err.message : String(err));
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
  } catch (err) {
    console.error('❌ Fatal error during import:', err);
    if (err instanceof Error) {
      console.error('Error details:', err.message);
      console.error('Stack trace:', err.stack);
    }
    process.exit(1);
  }
}

importBreeds();