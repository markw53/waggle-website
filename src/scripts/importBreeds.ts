// scripts/importBreeds.ts
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import * as fs from 'fs';
import Papa from 'papaparse';

interface CSVRow {
  Breed: string;
  Type: string;
  Height: string;
  Weight: string;
  Color: string;
  'DogTime Rank': string;
  Intelligence: string;
  Longevity: string;
  Problems: string;
  Expenses: string;
  'Meals/day': string;
  avg_puppy_price: string;
}

async function importBreeds() {
  const csvFile = fs.readFileSync('./breeds.csv', 'utf8');
  
  Papa.parse(csvFile, {
    header: true,
    skipEmptyLines: true,
    complete: async (results) => {
      const data = results.data as CSVRow[];
      
      console.log(`Found ${data.length} breeds to import...`);
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const row of data) {
        if (!row.Breed || row.Breed.trim() === '') {
          continue;
        }
        
        try {
          const breedId = row.Breed.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
          
          const breedData = {
            id: breedId,
            name: row.Breed.trim(),
            type: row.Type?.trim() || 'Unknown',
            height: row.Height?.trim() || 'N/A',
            weight: row.Weight?.trim() || 'N/A',
            color: row.Color?.trim() || 'Various',
            popularity: parseInt(row['DogTime Rank']) || 0,
            intelligence: parseInt(row.Intelligence) || 0,
            longevity: row.Longevity?.trim() || 'Unknown',
            healthProblems: row.Problems?.trim() || 'None reported',
            yearlyExpenses: parseFloat(row.Expenses?.replace(/[$,]/g, '') || '0') || 0,
            mealsPerDay: parseFloat(row['Meals/day'] || '2') || 2,
            avgPuppyPrice: parseFloat(row.avg_puppy_price?.replace(/[$,]/g, '') || '0') || 0,
            searchKeywords: [
              row.Breed.toLowerCase(),
              row.Type?.toLowerCase() || '',
              ...row.Breed.toLowerCase().split(' ')
            ].filter(Boolean)
          };
          
          await setDoc(doc(db, 'breeds', breedId), breedData);
          successCount++;
          console.log(`✅ ${successCount}/${data.length}: ${row.Breed}`);
        } catch (error: unknown) {
          errorCount++;
          console.error(`❌ Error importing ${row.Breed}:`, error);
        }
      }
      
      console.log('\n🎉 Import Summary:');
      console.log(`✅ Success: ${successCount}`);
      console.log(`❌ Errors: ${errorCount}`);
      console.log(`📊 Total: ${data.length}`);
    },
    error: (error: Error) => {
      console.error('❌ CSV Parse Error:', error);
    }
  });
}

importBreeds().catch((error: unknown) => {
  console.error('❌ Import failed:', error);
});