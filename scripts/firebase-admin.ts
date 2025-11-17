// scripts/firebase-admin.ts
import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔧 Initializing Firebase Admin SDK...');

// Method 1: Using service account key file (recommended)
function initWithServiceAccount(): boolean {
  const serviceAccountPath = join(process.cwd(), 'serviceAccountKey.json');
  
  if (existsSync(serviceAccountPath)) {
    try {
      const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
      
      console.log(`✅ Initialized with service account for project: ${serviceAccount.project_id}`);
      return true;
    } catch (err) {
      console.error('❌ Error reading service account file:', err);
      return false;
    }
  }
  
  return false;
}

// Method 2: Using application default credentials (fallback)
function initWithApplicationDefault(): boolean {
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
  
  if (!projectId) {
    console.error('❌ VITE_FIREBASE_PROJECT_ID is not set in .env file');
    return false;
  }
  
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: projectId,
    });
    
    console.log(`✅ Initialized with application default credentials for project: ${projectId}`);
    return true;
  } catch (err) {
    console.error('❌ Failed to initialize with application default credentials:', err);
    return false;
  }
}

// Try to initialize Firebase Admin
let initialized = false;

// Try service account first
if (!initialized) {
  initialized = initWithServiceAccount();
}

// Fallback to application default credentials
if (!initialized) {
  console.log('⚠️  Service account key not found, trying application default credentials...');
  initialized = initWithApplicationDefault();
}

// If still not initialized, show error and instructions
if (!initialized) {
  console.error('\n❌ Firebase Admin SDK initialization failed!');
  console.error('\n📋 To fix this, choose one of these options:\n');
  
  console.error('Option 1 (Recommended): Use Service Account Key');
  console.error('  1. Go to Firebase Console → Project Settings → Service Accounts');
  console.error('  2. Click "Generate New Private Key"');
  console.error('  3. Save the file as "serviceAccountKey.json" in your project root');
  console.error('  4. Add "serviceAccountKey.json" to your .gitignore');
  console.error('  5. Run your script again\n');
  
  console.error('Option 2: Use Application Default Credentials');
  console.error('  1. Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install');
  console.error('  2. Run: gcloud auth application-default login');
  console.error('  3. Make sure VITE_FIREBASE_PROJECT_ID is set in your .env file');
  console.error('  4. Run your script again\n');
  
  throw new Error('Firebase Admin SDK initialization failed');
}

// Export Firestore instance
export const db = admin.firestore();

// Export admin for other use cases
export { admin };

console.log('✅ Firebase Admin SDK ready to use\n');