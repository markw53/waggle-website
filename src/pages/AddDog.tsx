import React, { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../firebase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AddDog: React.FC = () => {
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB.');
        return;
      }
      setImageFile(file);
    }
  };

  const validateFields = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = 'Name is required.';
    if (!breed.trim()) newErrors.breed = 'Breed is required.';
    if (!age || isNaN(Number(age)) || Number(age) < 0) newErrors.age = 'Valid age is required.';
    if (!gender) newErrors.gender = 'Please select a gender.';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  console.log('Form submitted');
  
  const newErrors = validateFields();
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    console.log('Validation errors:', newErrors);
    return;
  }

  if (!auth.currentUser) {
    toast.error('You must be logged in to add a dog.');
    navigate('/');
    return;
  }

  setErrors({});
  setLoading(true);

  let imageUrl: string | undefined = undefined;

  try {
    // Upload image if present
    if (imageFile) {
      console.log('Uploading image...');
      const storageRef = ref(
        storage,
        `dog_images/${auth.currentUser.uid}/${Date.now()}_${imageFile.name}`
      );
      await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(storageRef);
      console.log('Image uploaded:', imageUrl);
    }

    // Add document to Firestore
    console.log('Adding dog to Firestore...');
    const docRef = await addDoc(collection(db, 'dogs'), {
      name: name.trim(),
      breed: breed.trim(),
      age: Number(age),
      gender,
      bio: bio.trim(),
      imageUrl: imageUrl || null,
      ownerId: auth.currentUser.uid,
      createdAt: Timestamp.now(),
    });
    console.log('Dog added with ID:', docRef.id);

    toast.success('Dog profile added successfully! 🐶');
    navigate('/dogs');
  } catch (error: unknown) {
    console.error('Full error object:', error);

    let errorCode = '';
    let errorMessage = '';

    if (typeof error === 'object' && error !== null) {
      errorCode = (error as { code?: string }).code ?? '';
      errorMessage = (error as { message?: string }).message ?? '';
    }

    console.error('Error code:', errorCode);
    console.error('Error message:', errorMessage);

    // More specific error messages
    if (errorCode === 'storage/unauthorized') {
      toast.error('Storage permission denied. Please check Firebase Storage rules.');
    } else if (errorCode === 'permission-denied') {
      toast.error('Permission denied. Please check Firestore rules.');
    } else if (errorMessage?.includes('storage')) {
      toast.error('Storage error. Make sure Firebase Storage is enabled.');
    } else {
      toast.error(`Failed to add dog: ${errorMessage || 'Unknown error'}`);
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-4xl mx-auto mt-10 mb-10 p-6 sm:p-8 bg-white/95 dark:bg-zinc-800/95 shadow-xl rounded-xl backdrop-blur-sm border border-zinc-200 dark:border-zinc-700">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#573a1c] dark:text-amber-200 mb-2">
          Add a New Dog 🐕
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Fill in the details to register your dog's profile
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Name */}
          <FormField
            label="Name"
            required
            error={errors.name}
          >
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={32}
              placeholder="e.g., Max, Bella"
              className="w-full border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500 placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-colors"
            />
          </FormField>

          {/* Breed */}
          <FormField
            label="Breed"
            required
            error={errors.breed}
          >
            <input
              type="text"
              value={breed}
              onChange={e => setBreed(e.target.value)}
              maxLength={32}
              placeholder="e.g., Golden Retriever"
              className="w-full border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500 placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-colors"
            />
          </FormField>

          {/* Age */}
          <FormField
            label="Age (years)"
            required
            error={errors.age}
          >
            <input
              type="number"
              min="0"
              max="25"
              value={age}
              onChange={e => setAge(e.target.value)}
              placeholder="e.g., 3"
              className="w-full border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500 placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-colors"
            />
          </FormField>

          {/* Gender */}
          <FormField
            label="Gender"
            required
            error={errors.gender}
          >
            <select
              title="Gender"
              aria-label="Gender"
              value={gender}
              onChange={e => setGender(e.target.value)}
              className="w-full border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500 transition-colors"
            >
              <option value="">Select gender</option>
              <option value="Male">Male 🐕</option>
              <option value="Female">Female 🐕</option>
            </select>
          </FormField>
        </div>

        {/* Bio */}
        <FormField label="Bio/Description">
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            maxLength={160}
            placeholder="Tell us about your dog's personality, health, and temperament..."
            rows={4}
            className="w-full border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500 placeholder:text-gray-500 dark:placeholder:text-gray-400 resize-y transition-colors"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {bio.length}/160 characters
          </p>
        </FormField>

        {/* Image Upload */}
        <FormField label="Profile Image">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg cursor-pointer bg-zinc-50 dark:bg-zinc-700/50 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or WEBP (Max 5MB)</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={loading}
                className="hidden"
              />
            </label>
          </div>
        </FormField>

        {/* Image Preview */}
        {imageFile && (
          <div className="flex justify-center">
            <div className="relative">
              <img
                src={URL.createObjectURL(imageFile)}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-full shadow-lg border-4 border-[#8c5628] dark:border-amber-600"
              />
              <button
                type="button"
                onClick={() => setImageFile(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/dogs')}
            className="flex-1 px-6 py-3 rounded-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 rounded-lg font-semibold text-white bg-[#8c5628] dark:bg-amber-700 hover:bg-[#6d4320] dark:hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Adding...
              </span>
            ) : (
              'Add Dog Profile'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Reusable Form Field Component
interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ label, required, error, children }) => (
  <div>
    <label className="block font-semibold text-gray-900 dark:text-gray-100 mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {error && (
      <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center gap-1">
        <span>⚠️</span> {error}
      </p>
    )}
  </div>
);

export default AddDog;