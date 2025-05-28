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
      setImageFile(e.target.files[0]);
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
    const newErrors = validateFields();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (imageFile && imageFile.size > 5 * 1024 * 1024) {
      toast.error('Image size exceeds 5MB.');
      return;
    }

    setErrors({});
    setLoading(true);

    let imageUrl: string | undefined = undefined;

    try {
      if (imageFile) {
        const storageRef = ref(
          storage,
          `dog_images/${auth.currentUser?.uid}/${Timestamp.now()}_${imageFile.name}`
        );
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, 'dogs'), {
        name,
        breed,
        age: Number(age),
        gender,
        bio,
        imageUrl: imageUrl || null,
        ownerId: auth.currentUser?.uid,
        createdAt: Timestamp.now(),
      });

      toast.success('Dog profile added!');
      navigate('/dogs');
    } catch {
      toast.error('Failed to add dog profile.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 sm:p-8 bg-white dark:bg-zinc-900 shadow-lg rounded-lg font-sans transition-colors">
      <h2 className="text-2xl font-semibold text-center text-zinc-800 dark:text-zinc-100 mb-6">Add a New Dog</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Name<span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={32}
            className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* Breed */}
        <div>
          <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Breed<span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={breed}
            onChange={e => setBreed(e.target.value)}
            maxLength={32}
            className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          {errors.breed && <p className="text-red-500 text-sm mt-1">{errors.breed}</p>}
        </div>

        {/* Age */}
        <div>
          <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Age (years)<span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            min="0"
            max="25"
            value={age}
            onChange={e => setAge(e.target.value)}
            className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
        </div>

        {/* Gender */}
        <div>
          <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Gender<span className="text-red-600">*</span>
          </label>
          <select
            value={gender}
            onChange={e => setGender(e.target.value)}
            className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
        </div>

        {/* Bio */}
        <div className="sm:col-span-2">
          <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">Bio/Description</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            maxLength={160}
            placeholder="Tell us about your dog..."
            className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-md px-3 py-2 min-h-[60px] resize-y focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        {/* Image Upload */}
        <div className="sm:col-span-2">
          <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">Profile Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={loading}
            className="w-full text-sm text-zinc-800 dark:text-zinc-100"
          />
        </div>

        {/* Image Preview */}
        {imageFile && (
          <div className="sm:col-span-2 flex justify-center mt-2">
            <img
              src={URL.createObjectURL(imageFile)}
              alt="Preview"
              className="w-28 h-28 object-cover rounded-full shadow-md border-2 border-green-100 dark:border-green-600"
            />
          </div>
        )}

        {/* Submit Button */}
        <div className="sm:col-span-2 mt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2 rounded-md font-semibold text-white bg-gradient-to-r from-green-400 to-blue-600 hover:from-blue-600 hover:to-green-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Add Dog'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDog;
