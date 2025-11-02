// src/pages/AddDog.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebase';
import { useAuth } from '@/context';
import HealthVerificationForm from '@/components/HealthVerificationForm';
import toast from 'react-hot-toast';
import { ROUTES } from '@/config/routes';

interface HealthInfo {
  vetVerified: boolean;
  vetName: string;
  vetPhone: string;
  lastCheckupDate: string;
  hipsDysplasiaCleared: boolean;
  elbowDysplasiaCleared: boolean;
  eyesCleared: boolean;
  heartCleared: boolean;
  geneticTestingDone: boolean;
  geneticTestResults: string[];
  vaccinationUpToDate: boolean;
  brucellosisTest: boolean;
  brucellosisTestDate: string;
  hasHereditaryConditions: boolean;
  hereditaryConditionsDetails: string;
  vetCertificateUrl?: string;
  vaccinationRecordUrl?: string;
}

const AddDog: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Multi-step form
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [dogData, setDogData] = useState({
    name: '',
    breed: '',
    age: '',
    gender: 'Male' as 'Male' | 'Female',
    bio: '',
    microchipNumber: '',
    kennelClubRegistration: '',
    breedingLicenseNumber: '',
  });

  const [healthInfo, setHealthInfo] = useState<HealthInfo | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const checkAgeEligibility = (age: number) => {
    const minimumAgeMet = age >= 2;
    const maximumAgeMet = age <= 8; // Can be adjusted based on breed
    
    if (!minimumAgeMet) {
      toast.error('Dogs must be at least 2 years old to be registered for breeding');
      return false;
    }
    
    if (!maximumAgeMet) {
      toast('Dogs over 8 years old may require additional veterinary approval', {
        icon: '⚠️',
        duration: 5000,
      });
    }
    
    return true;
  };

  const handleBasicInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const age = parseInt(dogData.age);
    
    if (!checkAgeEligibility(age)) {
      return;
    }
    
    setStep(2); // Move to health verification
  };

  const handleHealthInfoComplete = (submittedHealthInfo: HealthInfo) => {
    setHealthInfo(submittedHealthInfo);
    setStep(3); // Move to review
  };

  const calculateEligibility = (): {
  isEligible: boolean;
  reasonIfIneligible: string;
  minimumAgeMet: boolean;
  maximumAgeMet: boolean;
} => {
  const age = parseInt(dogData.age);
  const minimumAgeMet = age >= 2;
  const maximumAgeMet = age <= 8;
  
  // Check if all critical health requirements are met
  const criticalChecksPassed = 
    healthInfo?.vetVerified === true &&
    healthInfo?.brucellosisTest === true &&
    healthInfo?.vaccinationUpToDate === true &&
    healthInfo?.hasHereditaryConditions === false;
  
  const isEligible = minimumAgeMet && maximumAgeMet && criticalChecksPassed;
  
  let reasonIfIneligible = '';
  if (!minimumAgeMet) reasonIfIneligible = 'Dog is too young (minimum 2 years)';
  else if (!maximumAgeMet) reasonIfIneligible = 'Dog may be too old (requires additional verification)';
  else if (!healthInfo?.vetVerified) reasonIfIneligible = 'Veterinary verification required';
  else if (!healthInfo?.brucellosisTest) reasonIfIneligible = 'Brucellosis test required';
  else if (!healthInfo?.vaccinationUpToDate) reasonIfIneligible = 'Vaccinations must be up to date';
  else if (healthInfo?.hasHereditaryConditions) reasonIfIneligible = 'Has hereditary conditions that may prevent breeding';
  
  return {
    isEligible,
    reasonIfIneligible,
    minimumAgeMet,
    maximumAgeMet,
  };
};

  const handleFinalSubmit = async () => {
  if (!user) {
    toast.error('Please log in to add a dog');
    return;
  }

  if (!healthInfo) {
    toast.error('Health information is required');
    return;
  }

  setLoading(true);
  try {
    let imageUrl = '';
    
    // Upload image
    if (imageFile) {
      const imageRef = ref(storage, `dog_images/${user.uid}/${Date.now()}_${imageFile.name}`);
      await uploadBytes(imageRef, imageFile);
      imageUrl = await getDownloadURL(imageRef);
    }

    const eligibility = calculateEligibility();
    
    // ✅ Build healthInfo object without undefined values
    interface HealthInfoData {
      vetVerified: boolean;
      vetName: string;
      vetPhone: string;
      hipsDysplasiaCleared: boolean;
      elbowDysplasiaCleared: boolean;
      eyesCleared: boolean;
      heartCleared: boolean;
      geneticTestingDone: boolean;
      geneticTestResults: string[];
      vaccinationUpToDate: boolean;
      brucellosisTest: boolean;
      hasHereditaryConditions: boolean;
      hereditaryConditionsDetails: string;
      vetCertificateUrl?: string;
      vaccinationRecordUrl?: string;
      lastCheckupDate?: Timestamp;
      brucellosisTestDate?: Timestamp;
    }

    const healthInfoData: HealthInfoData = {
      vetVerified: healthInfo.vetVerified,
      vetName: healthInfo.vetName,
      vetPhone: healthInfo.vetPhone,
      hipsDysplasiaCleared: healthInfo.hipsDysplasiaCleared,
      elbowDysplasiaCleared: healthInfo.elbowDysplasiaCleared,
      eyesCleared: healthInfo.eyesCleared,
      heartCleared: healthInfo.heartCleared,
      geneticTestingDone: healthInfo.geneticTestingDone,
      geneticTestResults: healthInfo.geneticTestResults,
      vaccinationUpToDate: healthInfo.vaccinationUpToDate,
      brucellosisTest: healthInfo.brucellosisTest,
      hasHereditaryConditions: healthInfo.hasHereditaryConditions,
      hereditaryConditionsDetails: healthInfo.hereditaryConditionsDetails,
    };

    // Only add optional fields if they exist
    if (healthInfo.vetCertificateUrl) {
      healthInfoData.vetCertificateUrl = healthInfo.vetCertificateUrl;
    }
    if (healthInfo.vaccinationRecordUrl) {
      healthInfoData.vaccinationRecordUrl = healthInfo.vaccinationRecordUrl;
    }
    if (healthInfo.lastCheckupDate) {
      healthInfoData.lastCheckupDate = Timestamp.fromDate(new Date(healthInfo.lastCheckupDate));
    }
    if (healthInfo.brucellosisTestDate) {
      healthInfoData.brucellosisTestDate = Timestamp.fromDate(new Date(healthInfo.brucellosisTestDate));
    }

    // ✅ Build breedingEligibility without undefined values
    interface BreedingEligibilityData {
      isEligible: boolean;
      reasonIfIneligible: string;
      minimumAgeMet: boolean;
      maximumAgeMet: boolean;
      numberOfLitters: number;
      breedingLicenseNumber?: string;
      kennelClubRegistration?: string;
    }

    const breedingEligibilityData: BreedingEligibilityData = {
      isEligible: eligibility.isEligible,
      reasonIfIneligible: eligibility.reasonIfIneligible,
      minimumAgeMet: eligibility.minimumAgeMet,
      maximumAgeMet: eligibility.maximumAgeMet,
      numberOfLitters: 0,
    };

    if (dogData.breedingLicenseNumber) {
      breedingEligibilityData.breedingLicenseNumber = dogData.breedingLicenseNumber;
    }
    if (dogData.kennelClubRegistration) {
      breedingEligibilityData.kennelClubRegistration = dogData.kennelClubRegistration;
    }

    // ✅ Build documents without undefined values
    interface DocumentsData {
      microchipNumber?: string;
    }

    const documentsData: DocumentsData = {};
    if (dogData.microchipNumber) {
      documentsData.microchipNumber = dogData.microchipNumber;
    }

    // ✅ Build new dog object
    interface NewDogData {
      name: string;
      breed: string;
      age: number;
      gender: 'Male' | 'Female';
      ownerId: string;
      createdAt: Timestamp;
      healthInfo: HealthInfoData;
      breedingEligibility: BreedingEligibilityData;
      temperament: {
        aggressionIssues: boolean;
        anxietyIssues: boolean;
        trainable: boolean;
        goodWithOtherDogs: boolean;
      };
      documents: DocumentsData;
      adminVerification: {
        verified: boolean;
      };
      status: 'pending' | 'approved' | 'rejected' | 'suspended';
      imageUrl?: string;
      bio?: string;
    }

    const newDog: NewDogData = {
      name: dogData.name,
      breed: dogData.breed,
      age: parseInt(dogData.age),
      gender: dogData.gender,
      ownerId: user.uid,
      createdAt: Timestamp.fromDate(new Date()),
      healthInfo: healthInfoData,
      breedingEligibility: breedingEligibilityData,
      temperament: {
        aggressionIssues: false,
        anxietyIssues: false,
        trainable: true,
        goodWithOtherDogs: true,
      },
      documents: documentsData,
      adminVerification: {
        verified: false,
      },
      status: 'pending',
    };

    // Only add optional fields if they exist
    if (imageUrl) {
      newDog.imageUrl = imageUrl;
    }
    if (dogData.bio) {
      newDog.bio = dogData.bio;
    }

    await addDoc(collection(db, 'dogs'), newDog);
    
    toast.success('Dog registered successfully! Pending admin verification.', {
      duration: 5000,
    });
    
    navigate(ROUTES.DASHBOARD);
  } catch (error) {
    console.error('Error adding dog:', error);
    toast.error('Failed to register dog');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-4xl mx-auto my-10 p-6 sm:p-8">
      <div className="bg-white/95 dark:bg-zinc-800/95 rounded-xl shadow-xl backdrop-blur-sm border border-zinc-200 dark:border-zinc-700">
        {/* Progress Steps */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= stepNum
                      ? 'bg-[#8c5628] dark:bg-amber-700 text-white'
                      : 'bg-zinc-200 dark:bg-zinc-700 text-gray-500'
                  }`}
                  aria-label={`Step ${stepNum}`}
                  role="status"
                >
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div
                    className={`w-16 sm:w-24 h-1 mx-2 ${
                      step > stepNum
                        ? 'bg-[#8c5628] dark:bg-amber-700'
                        : 'bg-zinc-200 dark:bg-zinc-700'
                    }`}
                    aria-hidden="true"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <span>Basic Info</span>
            <span>Health Verification</span>
            <span>Review</span>
          </div>
        </div>

        <div className="p-6">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <form onSubmit={handleBasicInfoSubmit} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#573a1c] dark:text-amber-200 mb-4">
                  Basic Dog Information
                </h2>
              </div>

              {/* Image Upload */}
              <div>
                <label htmlFor="dogPhoto" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Dog Photo
                </label>
                {imagePreview && (
                  <div className="mb-4">
                    <img
                      src={imagePreview}
                      alt="Dog preview"
                      className="w-32 h-32 rounded-full object-cover border-4 border-[#8c5628] dark:border-amber-600"
                    />
                  </div>
                )}
                <input
                  type="file"
                  id="dogPhoto"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg"
                  title="Upload a photo of your dog"
                />
              </div>

              {/* Name */}
              <div>
                <label htmlFor="dogName" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Dog's Name *
                </label>
                <input
                  type="text"
                  id="dogName"
                  value={dogData.name}
                  onChange={(e) => setDogData({ ...dogData, name: e.target.value })}
                  required
                  maxLength={50}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg"
                  placeholder="Max"
                  title="Enter your dog's name"
                />
              </div>

              {/* Breed */}
              <div>
                <label htmlFor="dogBreed" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Breed *
                </label>
                <input
                  type="text"
                  id="dogBreed"
                  value={dogData.breed}
                  onChange={(e) => setDogData({ ...dogData, breed: e.target.value })}
                  required
                  maxLength={50}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg"
                  placeholder="Golden Retriever"
                  title="Enter your dog's breed"
                />
              </div>

              {/* Age */}
              <div>
                <label htmlFor="dogAge" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Age (years) *
                </label>
                <input
                  type="number"
                  id="dogAge"
                  value={dogData.age}
                  onChange={(e) => setDogData({ ...dogData, age: e.target.value })}
                  required
                  min="2"
                  max="15"
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg"
                  title="Enter your dog's age in years"
                  placeholder="3"
                />
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  ⚠️ Dogs must be at least 2 years old to register for breeding
                </p>
              </div>

              {/* Gender */}
              <div>
                <label htmlFor="dogGender" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Gender *
                </label>
                <select
                  id="dogGender"
                  value={dogData.gender}
                  onChange={(e) => setDogData({ ...dogData, gender: e.target.value as 'Male' | 'Female' })}
                  required
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg"
                  title="Select your dog's gender"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="dogBio" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  About This Dog
                </label>
                <textarea
                  id="dogBio"
                  value={dogData.bio}
                  onChange={(e) => setDogData({ ...dogData, bio: e.target.value })}
                  maxLength={500}
                  rows={4}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg"
                  placeholder="Tell us about your dog's personality, achievements, etc."
                  title="Enter information about your dog"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {dogData.bio.length}/500 characters
                </p>
              </div>

              {/* Microchip */}
              <div>
                <label htmlFor="microchip" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Microchip Number
                </label>
                <input
                  type="text"
                  id="microchip"
                  value={dogData.microchipNumber}
                  onChange={(e) => setDogData({ ...dogData, microchipNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg"
                  placeholder="123456789012345"
                  title="Enter microchip number if available"
                />
              </div>

              {/* Kennel Club Registration */}
              <div>
                <label htmlFor="kennelClub" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Kennel Club Registration Number
                </label>
                <input
                  type="text"
                  id="kennelClub"
                  value={dogData.kennelClubRegistration}
                  onChange={(e) => setDogData({ ...dogData, kennelClubRegistration: e.target.value })}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg"
                  placeholder="AKC/KC registration number"
                  title="Enter kennel club registration number if available"
                />
              </div>

              {/* Breeding License */}
              <div>
                <label htmlFor="breedingLicense" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Breeding License Number (if applicable)
                </label>
                <input
                  type="text"
                  id="breedingLicense"
                  value={dogData.breedingLicenseNumber}
                  onChange={(e) => setDogData({ ...dogData, breedingLicenseNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg"
                  placeholder="License number"
                  title="Enter breeding license number if available"
                />
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-[#8c5628] dark:bg-amber-700 text-white rounded-lg hover:bg-[#6d4320] dark:hover:bg-amber-600 transition-colors font-semibold"
                title="Continue to health verification"
              >
                Continue to Health Verification →
              </button>
            </form>
          )}

          {/* Step 2: Health Verification */}
          {step === 2 && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#573a1c] dark:text-amber-200 mb-2">
                  Health Verification
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Please provide health information and veterinary documentation for {dogData.name}
                </p>
              </div>

              <HealthVerificationForm
                onComplete={handleHealthInfoComplete}
              />

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full mt-4 px-6 py-3 bg-zinc-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors font-semibold"
                title="Go back to basic information"
              >
                ← Back to Basic Info
              </button>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {step === 3 && healthInfo && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#573a1c] dark:text-amber-200 mb-4">
                  Review & Submit
                </h2>
              </div>

              {/* Eligibility Status */}
              {(() => {
                const eligibility = calculateEligibility();
                return (
                  <div
                    className={`p-6 rounded-lg border-2 ${
                      eligibility.isEligible
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    <h3 className="font-semibold text-lg mb-2">
                      {eligibility.isEligible ? '✅ Breeding Eligible' : '⚠️ Pending Verification'}
                    </h3>
                    <p className="text-sm">
                      {eligibility.isEligible
                        ? 'This dog meets all basic requirements for breeding registration. Final approval pending admin review.'
                                                : eligibility.reasonIfIneligible}
                    </p>
                  </div>
                );
              })()}

              {/* Basic Info Summary */}
              <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg border border-zinc-200 dark:border-zinc-700">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-4">
                  Basic Information
                </h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Name:</span> {dogData.name}</p>
                  <p><span className="font-medium">Breed:</span> {dogData.breed}</p>
                  <p><span className="font-medium">Age:</span> {dogData.age} years</p>
                  <p><span className="font-medium">Gender:</span> {dogData.gender}</p>
                  {dogData.microchipNumber && (
                    <p><span className="font-medium">Microchip:</span> {dogData.microchipNumber}</p>
                  )}
                </div>
              </div>

              {/* Health Summary */}
              <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg border border-zinc-200 dark:border-zinc-700">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-4">
                  Health Information
                </h3>
                <div className="space-y-2 text-sm">
                  <p>✅ Veterinary Verified: {healthInfo.vetVerified ? 'Yes' : 'No'}</p>
                  <p>✅ Brucellosis Test: {healthInfo.brucellosisTest ? 'Negative' : 'Pending'}</p>
                  <p>✅ Vaccinations: {healthInfo.vaccinationUpToDate ? 'Up to Date' : 'Pending'}</p>
                  <p>✅ Genetic Testing: {healthInfo.geneticTestingDone ? 'Completed' : 'Not Done'}</p>
                  {healthInfo.vetName && (
                    <p><span className="font-medium">Veterinarian:</span> {healthInfo.vetName}</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-[#8c5628] dark:bg-amber-700 text-white rounded-lg hover:bg-[#6d4320] dark:hover:bg-amber-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Submit dog for verification"
                >
                  {loading ? 'Submitting...' : 'Submit for Verification'}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-zinc-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors font-semibold"
                  title="Go back to health verification"
                >
                  ← Back to Health Verification
                </button>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  ℹ️ Your dog will be reviewed by our admin team within 24-48 hours. You'll receive a notification once the verification is complete.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddDog;