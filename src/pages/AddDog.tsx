import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { Timestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import './AddDog.css';

const AddDog: React.FC = () => {
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !breed || !age || !gender) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setLoading(true);

    let imageUrl: string | undefined = undefined;

    try {
      // First, upload image if chosen
      if (imageFile) {
        const storageRef = ref(
          storage,
          `dog_images/${auth.currentUser?.uid}/${Timestamp.now()}_${imageFile.name}`
        );
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      if (imageFile && imageFile.size > 5 * 1024 * 1024) {
        toast.error('Image size exceeds 5MB.'); 
        setLoading(false);
        return;
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
    <div className="add-dog-form-container">
      <h2>Add a New Dog</h2>
      <form className="add-dog-form" onSubmit={handleSubmit}>
        <label>
          Name<span>*</span>
          <input
            type="text"
            value={name}
            maxLength={32}
            onChange={e => setName(e.target.value)}
            required
          />
        </label>
        <label>
          Breed<span>*</span>
          <input
            type="text"
            value={breed}
            maxLength={32}
            onChange={e => setBreed(e.target.value)}
            required
          />
        </label>
        <label>
          Age (years)<span>*</span>
          <input
            type="number"
            min="0"
            max="25"
            value={age}
            onChange={e => setAge(e.target.value)}
            required
          />
        </label>
        <label>
          Gender<span>*</span>
          <select value={gender} onChange={e => setGender(e.target.value)} required>
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </label>
        <label>
          Bio/Description
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            maxLength={160}
            placeholder="Tell us about your dog..."
          />
        </label>
        <label>
          Profile Image
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={loading}
          />
        </label>
        {imageFile && (
          <div className="add-dog-image-preview-container">
            <img
              src={URL.createObjectURL(imageFile)}
              alt="Preview"
              className="add-dog-image-preview"
            />
          </div>
        )}
        <button className="add-dog-btn" type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Dog'}
        </button>
      </form>
    </div>
  );
};

export default AddDog;