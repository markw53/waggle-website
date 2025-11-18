// scripts/deleteBreeds.ts
import { db } from './firebase-admin';

async function deleteAllBreeds() {
  console.log('🗑️  Starting breed deletion...\n');
  
  try {
    const breedsRef = db.collection('breeds');
    const snapshot = await breedsRef.get();
    
    if (snapshot.empty) {
      console.log('✅ No breeds found. Collection is already empty.\n');
      process.exit(0);
      return;
    }
    
    console.log(`📊 Found ${snapshot.size} breeds to delete\n`);
    
    // Confirm deletion
    console.log('⚠️  This will delete ALL breed data!');
    console.log('   Press Ctrl+C to cancel, or wait 5 seconds to proceed...\n');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('🗑️  Deleting breeds...\n');
    
    // Delete in batches (Firestore limit is 500 per batch)
    const batchSize = 500;
    let deletedCount = 0;
    
    while (true) {
      const snapshot = await breedsRef.limit(batchSize).get();
      
      if (snapshot.empty) {
        break;
      }
      
      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
        deletedCount++;
      });
      
      await batch.commit();
      console.log(`   Deleted ${deletedCount} breeds...`);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ Deletion Complete!');
    console.log('='.repeat(50));
    console.log(`🗑️  Total deleted: ${deletedCount}`);
    console.log('='.repeat(50) + '\n');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during deletion:', err);
    if (err instanceof Error) {
      console.error('Error details:', err.message);
    }
    process.exit(1);
  }
}

deleteAllBreeds();