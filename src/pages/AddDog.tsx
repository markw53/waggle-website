// src/pages/AddDog.tsx
import { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebase';
import { useAuth } from '@/context/useAuth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ROUTES } from '@/config/routes';
import { BreedAutocomplete } from '@/components/BreedAutocomplete';
import type { BreedInfo } from '@/types/breed';

export default function AddDog() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Basic dog info
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState<number>(2);
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [selectedBreedInfo, setSelectedBreedInfo] = useState<BreedInfo | null>(null);

  // Health info
  const [vetVerified, setVetVerified] = useState(false);
  const [brucellosisTest, setBrucellosisTest] = useState(false);

  // Kennel Club info
  const [kcRegistrationNumber, setKcRegistrationNumber] = useState('');
  const [kcRegisteredName, setKcRegisteredName] = useState('');
  const [kcPapers, setKcPapers] = useState<File | null>(null);
  const [kcPapersPreview, setKcPapersPreview] = useState<string>('');

  // Location info (GB-localized)
  const [location, setLocation] = useState({
    lat: 0,
    lng: 0,
    city: '',
    county: '',
    postcode: '',
    country: 'United Kingdom',
  });
  const [gettingLocation, setGettingLocation] = useState(false);

  // Form state
  const [loading, setLoading] = useState(false);

  // Handle photo selection
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle KC papers selection
  const handleKcPapersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setKcPapers(file);
      // Show filename preview for PDFs
      if (file.type === 'application/pdf') {
        setKcPapersPreview(file.name);
      } else {
        // Show image preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setKcPapersPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Validate KC registration number format (2 letters + 8 digits)
  const validateKCNumber = (number: string): boolean => {
    if (!number) return true; // Optional field
    const kcPattern = /^[A-Z]{2}\d{8}$/;
    return kcPattern.test(number);
  };

  // Reverse geocoding using Nominatim (free, no API key)
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Waggle Dog Breeding App', // Required by Nominatim
          },
        }
      );
      const data = await response.json();

      if (data.address) {
        setLocation({
          lat,
          lng,
          city: data.address.city || data.address.town || data.address.village || '',
          county: data.address.county || data.address.state_district || '',
          postcode: data.address.postcode || '',
          country: data.address.country || 'United Kingdom',
        });
        toast.success('Location details filled automatically!');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Geocoding error:', error.message);
      }
      // Still save coordinates even if geocoding fails
      setLocation(prev => ({ ...prev, lat, lng }));
      toast('Location detected (manual entry needed for address)', {
        icon: 'ℹ️',
      });
    }
  };

  // Get user's location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by your browser');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        await reverseGeocode(lat, lng);
        setGettingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Could not get your location. Please enter manually.');
        setGettingLocation(false);
      }
    );
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('You must be logged in to add a dog');
      return;
    }

    if (!photo) {
      toast.error('Please upload a photo of your dog');
      return;
    }

    if (!vetVerified || !brucellosisTest) {
      toast.error('Both health verifications are required');
      return;
    }

    // Validate KC registration number if provided
    if (kcRegistrationNumber && !validateKCNumber(kcRegistrationNumber)) {
      toast.error('Invalid KC registration number format. Expected format: AB12345678 (2 letters + 8 digits)');
      return;
    }

    setLoading(true);

    try {
      // Upload photo to Firebase Storage
      const photoRef = ref(storage, `dogs/${user.uid}/${Date.now()}_${photo.name}`);
      await uploadBytes(photoRef, photo);
      const photoURL = await getDownloadURL(photoRef);

      // Upload KC papers if provided
      let kcPapersURL = '';
      if (kcPapers) {
        const kcPapersRef = ref(storage, `kc_papers/${user.uid}/${Date.now()}_${kcPapers.name}`);
        await uploadBytes(kcPapersRef, kcPapers);
        kcPapersURL = await getDownloadURL(kcPapersRef);
      }

      // Create dog document
      const dogData = {
        name,
        breed,
        age,
        gender,
        bio: description,
        imageUrl: photoURL,
        ownerId: user.uid,
        status: 'pending' as const,
        
        // Health Info
        healthInfo: {
          vetVerified,
          brucellosisTest,
          hipsDysplasiaCleared: false,
          elbowDysplasiaCleared: false,
          eyesCleared: false,
          heartCleared: false,
          geneticTestingDone: false,
          vaccinationUpToDate: false,
          hasHereditaryConditions: false,
        },
        
        // Breeding Eligibility
        breedingEligibility: {
          isEligible: age >= 2 && age <= 8,
          minimumAgeMet: age >= 2,
          maximumAgeMet: age <= 8,
          reasonIfIneligible: age < 2 ? 'Dog must be at least 2 years old' : age > 8 ? 'Dog may be too old for breeding' : undefined,
        },
        
        // Temperament
        temperament: {
          aggressionIssues: false,
          anxietyIssues: false,
          trainable: true,
          goodWithOtherDogs: true,
        },
        
        // Documents (including KC papers)
        documents: {
          ...(kcPapersURL && { registrationPapers: kcPapersURL }),
        },
        
        // Kennel Club Info (if provided)
        ...(kcRegistrationNumber && {
          kennelClubInfo: {
            registrationNumber: kcRegistrationNumber,
            registeredName: kcRegisteredName || name,
            breedRegistered: breed,
            dateRegistered: Timestamp.now(),
            registrationVerified: false, // Admin will verify
            ...(kcPapersURL && { registrationDocumentUrl: kcPapersURL }),
          },
        }),
        
        // Admin Verification
        adminVerification: {
          verified: false,
        },
        
        // Only include location if lat/lng are set
        ...(location.lat !== 0 && location.lng !== 0 && {
          location: {
            lat: location.lat,
            lng: location.lng,
            city: location.city,
            county: location.county,
            postcode: location.postcode,
            country: location.country,
          },
        }),
        
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, 'dogs'), dogData);

      toast.success('Dog added successfully! Awaiting admin approval.');
      navigate(ROUTES.MY_DOGS);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error adding dog:', error);
        toast.error(`Failed to add dog: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Add Your Dog
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Share your dog's profile to find breeding matches
      </p>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white border-b pb-2">
            Basic Information
          </h3>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Dog's Name *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={50}
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label htmlFor="breed" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Breed *
            </label>
            <BreedAutocomplete
              value={breed}
              onChange={setBreed}
              onBreedSelect={setSelectedBreedInfo}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Start typing to search 277 recognized breeds
            </p>
            
            {/* Breed Info Preview */}
            {selectedBreedInfo && (
              <div className="mt-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                  <span>📚</span> Breed Information
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Type:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{selectedBreedInfo.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Lifespan:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{selectedBreedInfo.longevity}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Intelligence:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">Rank #{selectedBreedInfo.intelligence}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Popularity:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">#{selectedBreedInfo.popularity}</span>
                  </div>
                </div>
                {selectedBreedInfo.healthProblems !== 'None reported' && (
                  <div className="mt-2 pt-2 border-t border-indigo-200 dark:border-indigo-700">
                    <p className="text-xs">
                      <span className="text-yellow-700 dark:text-yellow-400 font-semibold">⚠️ Common Health Issues:</span>
                      <span className="ml-2 text-gray-700 dark:text-gray-300">{selectedBreedInfo.healthProblems}</span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Age *
              </label>
              <input
                id="age"
                type="number"
                min={2}
                max={25}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Gender *
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100"
              placeholder="Tell us about your dog's temperament, achievements, etc."
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {description.length}/500 characters
            </p>
          </div>

          <div>
            <label htmlFor="photo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Photo *
            </label>
            <input
              id="photo"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100"
            />
            {photoPreview && (
              <img
                src={photoPreview}
                alt="Preview"
                className="mt-3 w-32 h-32 object-cover rounded-lg"
              />
            )}
          </div>
        </div>

        {/* Kennel Club Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white border-b pb-2">
            Kennel Club Registration (Optional)
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Providing KC registration increases trust and credibility
          </p>

          {/* Info Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                <strong className="font-semibold">Why register?</strong> KC registration shows your dog meets breed standards and helps verify pedigree information.
              </span>
            </p>
          </div>

          <div>
            <label htmlFor="kcNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              KC Registration Number
            </label>
            <input
              id="kcNumber"
              type="text"
              placeholder="e.g., AB12345678"
              value={kcRegistrationNumber}
              onChange={(e) => setKcRegistrationNumber(e.target.value.toUpperCase())}
              maxLength={10}
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Format: 2 letters + 8 digits (e.g., AB12345678)
            </p>
            {kcRegistrationNumber && !validateKCNumber(kcRegistrationNumber) && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                ⚠️ Invalid format. Expected: 2 letters + 8 digits
              </p>
            )}
          </div>

          <div>
            <label htmlFor="kcName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              KC Registered Name
            </label>
            <input
              id="kcName"
              type="text"
              placeholder="e.g., Champion Oakwood's Golden Star"
              value={kcRegisteredName}
              onChange={(e) => setKcRegisteredName(e.target.value)}
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Official name as it appears on KC papers (if different from pet name)
            </p>
          </div>

          <div>
            <label htmlFor="kcPapers" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              KC Registration Papers
            </label>
            <input
              id="kcPapers"
              type="file"
              accept="application/pdf,image/*"
              onChange={handleKcPapersChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Upload a scan or photo of your KC registration certificate (PDF or image)
            </p>
            {kcPapersPreview && (
              <div className="mt-3">
                {kcPapers?.type === 'application/pdf' ? (
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">{kcPapersPreview}</span>
                  </div>
                ) : (
                  <img
                    src={kcPapersPreview}
                    alt="KC Papers Preview"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                )}
              </div>
            )}
          </div>

          {/* Quick Link to KC */}
          <div className="bg-gray-50 dark:bg-zinc-700/50 p-4 rounded-lg border border-gray-200 dark:border-zinc-600">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 font-medium">
              Need to register your dog?
            </p>
            <a
              href="https://www.thekennelclub.org.uk/registration/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              Visit The Kennel Club Website
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {/* Location Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white border-b pb-2">
            Location (Optional but Recommended)
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Help others find breeding partners near them
          </p>

          {/* Privacy Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                <strong className="font-semibold">Privacy:</strong> Your exact location is only used for map centering and is not stored. 
                Only your dog's approximate area (city/county) is visible to others.
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={handleGetLocation}
            disabled={gettingLocation}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {gettingLocation ? 'Detecting Location...' : 'Use My Location'}
          </button>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                City/Town
              </label>
              <input
                id="city"
                type="text"
                placeholder="London"
                value={location.city}
                onChange={(e) => setLocation(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label htmlFor="county" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                County
              </label>
              <input
                id="county"
                type="text"
                placeholder="Greater London"
                value={location.county}
                onChange={(e) => setLocation(prev => ({ ...prev, county: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div>
            <label htmlFor="postcode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Postcode
            </label>
            <input
              id="postcode"
              type="text"
              placeholder="SW1A 1AA"
              value={location.postcode}
              onChange={(e) => setLocation(prev => ({ ...prev, postcode: e.target.value.toUpperCase() }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        {/* Health Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white border-b pb-2">
            Health Verification *
          </h3>

          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={vetVerified}
                onChange={(e) => setVetVerified(e.target.checked)}
                required
                className="mt-1 w-4 h-4 text-amber-700 border-gray-300 rounded focus:ring-amber-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                I confirm this dog has been examined by a licensed veterinarian and is in good health for breeding
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={brucellosisTest}
                onChange={(e) => setBrucellosisTest(e.target.checked)}
                required
                className="mt-1 w-4 h-4 text-amber-700 border-gray-300 rounded focus:ring-amber-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                I confirm this dog has been tested for Brucellosis and the result was negative
              </span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-700 hover:bg-amber-600 text-white py-3 rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Adding Dog...' : 'Add Dog for Approval'}
        </button>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Your dog will be reviewed by an admin before appearing publicly
        </p>
      </form>
    </div>
  );
}