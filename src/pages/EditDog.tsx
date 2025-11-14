// src/pages/EditDog.tsx
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebase';
import { useAuth } from '@/context/useAuth';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ROUTES } from '@/config/routes';
import type { Dog } from '@/types/dog';
import { BreedAutocomplete } from '@/components/BreedAutocomplete';
import type { BreedInfo } from '@/types/breed';

export default function EditDog() {
  const { id } = useParams<{ id: string }>();
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
  const [existingPhotoURL, setExistingPhotoURL] = useState<string>('');
  const [kcRegistrationNumber, setKcRegistrationNumber] = useState('');
  const [kcRegisteredName, setKcRegisteredName] = useState('');
  const [kcPapers, setKcPapers] = useState<File | null>(null);
  const [kcPapersPreview, setKcPapersPreview] = useState<string>('');
  const [existingKcPapersURL, setExistingKcPapersURL] = useState<string>('');
  const [selectedBreedInfo, setSelectedBreedInfo] = useState<BreedInfo | null>(null);
  // Health info
  const [vetVerified, setVetVerified] = useState(false);
  const [brucellosisTest, setBrucellosisTest] = useState(false);

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
  const [fetchingDog, setFetchingDog] = useState(true);

  // Fetch existing dog data
  useEffect(() => {
    const fetchDog = async () => {
      if (!id) {
        toast.error('Invalid dog ID');
        navigate(ROUTES.MY_DOGS);
        return;
      }

      if (!user) {
        toast.error('You must be logged in');
        navigate(ROUTES.HOME);
        return;
      }

      setFetchingDog(true);
      try {
        const dogDoc = await getDoc(doc(db, 'dogs', id));
        
        if (!dogDoc.exists()) {
          toast.error('Dog not found');
          navigate(ROUTES.MY_DOGS);
          return;
        }

        const dogData = { id: dogDoc.id, ...dogDoc.data() } as Dog;

        // Verify ownership
        if (dogData.ownerId !== user.uid) {
          toast.error('You do not have permission to edit this dog');
          navigate(ROUTES.MY_DOGS);
          return;
        }

        // Populate form with existing data
        setName(dogData.name);
        setBreed(dogData.breed);
        setAge(dogData.age);
        setGender(dogData.gender);
        setDescription(dogData.bio || '');
        setExistingPhotoURL(dogData.imageUrl || '');
        setPhotoPreview(dogData.imageUrl || '');
        setVetVerified(dogData.healthInfo?.vetVerified || false);
        setBrucellosisTest(dogData.healthInfo?.brucellosisTest || false);

        if (dogData.kennelClubInfo) {
          setKcRegistrationNumber(dogData.kennelClubInfo.registrationNumber || '');
          setKcRegisteredName(dogData.kennelClubInfo.registeredName || '');
          setExistingKcPapersURL(dogData.kennelClubInfo.registrationDocumentUrl || '');
          setKcPapersPreview(dogData.kennelClubInfo.registrationDocumentUrl || '');
        }

        if (dogData.location) {
          setLocation({
            lat: dogData.location.lat || 0,
            lng: dogData.location.lng || 0,
            city: dogData.location.city || '',
            county: dogData.location.county || '',
            postcode: dogData.location.postcode || '',
            country: dogData.location.country || 'United Kingdom',
          });
        }
      } catch (error) {
        console.error('Error fetching dog:', error);
        toast.error('Failed to load dog details');
        navigate(ROUTES.MY_DOGS);
      } finally {
        setFetchingDog(false);
      }
    };

    fetchDog();
  }, [id, user, navigate]);

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

  const handleKcPapersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setKcPapers(file);
      if (file.type === 'application/pdf') {
        setKcPapersPreview(file.name);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setKcPapersPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const validateKCNumber = (number: string): boolean => {
    if (!number) return true;
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
            'User-Agent': 'Waggle Dog Breeding App',
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

    if (!user || !id) {
      toast.error('Invalid request');
      return;
    }

    if (!vetVerified || !brucellosisTest) {
      toast.error('Both health verifications are required');
      return;
    }

    setLoading(true);

    try {
      let photoURL = existingPhotoURL;

      // Upload new photo if one was selected
      if (photo) {
        const photoRef = ref(storage, `dogs/${user.uid}/${Date.now()}_${photo.name}`);
        await uploadBytes(photoRef, photo);
        photoURL = await getDownloadURL(photoRef);
      }

      // Upload new KC papers if one was selected
      let kcPapersURL = existingKcPapersURL;
      if (kcPapers) {
        const kcPapersRef = ref(storage, `kc_papers/${user.uid}/${Date.now()}_${kcPapers.name}`);
        await uploadBytes(kcPapersRef, kcPapers);
        kcPapersURL = await getDownloadURL(kcPapersRef);
      }

      // Update dog document
      const dogData = {
        name,
        breed,
        age,
        gender,
        bio: description,
        imageUrl: photoURL,
        healthInfo: {
          vetVerified,
          brucellosisTest,
        },
        // Reset to pending if it was rejected
        status: 'pending',
        // Clear admin verification on edit
        adminVerification: {
          verified: false,
          verifiedAt: null,
          verifiedBy: null,
          rejectionReason: null,
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
        // Kennel Club Info (if provided)
        ...(kcRegistrationNumber && {
          kennelClubInfo: {
            registrationNumber: kcRegistrationNumber,
            registeredName: kcRegisteredName || name,
            breedRegistered: breed,
            registrationVerified: false, // Reset verification on edit
            ...(kcPapersURL && { registrationDocumentUrl: kcPapersURL }),
          },
        }),
        updatedAt: Timestamp.now(),
      };

      await updateDoc(doc(db, 'dogs', id), dogData);

      toast.success('Dog updated successfully! Awaiting admin approval.');
      navigate(ROUTES.MY_DOGS);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error updating dog:', error);
        toast.error(`Failed to update dog: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchingDog) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-700 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading dog details...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header with background */}
      <div className="bg-white/95 dark:bg-zinc-800/95 backdrop-blur-sm rounded-lg shadow-lg p-6 mb-6 border border-zinc-200 dark:border-zinc-700">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate(ROUTES.MY_DOGS)}
          className="mb-4 flex items-center gap-2 text-amber-700 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to My Dogs
        </button>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Edit Dog Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Update your dog's information. Changes will require admin re-approval.
        </p>
      </div>

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
              Photo {existingPhotoURL && '(Leave empty to keep current photo)'}
            </label>
            <input
              id="photo"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100"
            />
            {photoPreview && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {photo ? 'New photo preview:' : 'Current photo:'}
                </p>
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg"
                />
              </div>
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
                <strong className="font-semibold">Note:</strong> Updating KC information will reset verification status and require admin re-approval.
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
              KC Registration Papers {existingKcPapersURL && '(Leave empty to keep current)'}
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
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {kcPapers ? 'New document:' : 'Current document:'}
                </p>
                {kcPapers?.type === 'application/pdf' || kcPapersPreview.endsWith('.pdf') ? (
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">{kcPapers?.name || 'Current KC Papers'}</span>
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

                {/* Warning about re-approval */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <p className="text-sm text-amber-800 dark:text-amber-200 flex items-start gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>
              <strong className="font-semibold">Note:</strong> Editing your dog's profile will reset its status to "pending" and require admin re-approval before it appears publicly again.
            </span>
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate(ROUTES.MY_DOGS)}
            className="flex-1 bg-gray-300 dark:bg-zinc-700 hover:bg-gray-400 dark:hover:bg-zinc-600 text-gray-800 dark:text-gray-200 py-3 rounded-md font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-amber-700 hover:bg-amber-600 text-white py-3 rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Updating Dog...' : 'Update Dog'}
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Your dog will be reviewed by an admin before appearing publicly
        </p>
      </form>
    </div>
  );
}