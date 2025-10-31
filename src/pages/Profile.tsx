import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebase'; // ✅ Removed 'auth' from here
import { useAuth } from '@/context';
import type { UserProfile } from '@/types/user';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [profile, setProfile] = useState<UserProfile>({
    uid: user?.uid || '',
    email: user?.email || '',
    displayName: user?.displayName || '',
    photoURL: user?.photoURL || '',
    bio: '',
    location: '',
    phoneNumber: '',
    createdAt: Timestamp.fromDate(new Date()),
  });

 useEffect(() => {
  if (!user) {
    toast.error('Please log in to view your profile');
    navigate('/');
    return;
  }

  const fetchProfile = async () => {
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('Firestore data:', data);
        console.log('Firebase Auth photoURL:', user.photoURL);
        
        setProfile({
          uid: user.uid,
          email: data.email || user.email || '',
          displayName: data.displayName || data.name || user.displayName || '',
          name: data.name || data.displayName || user.displayName || '',
          photoURL: user.photoURL || data.photoURL || '', 
          bio: data.bio || '',
          location: data.location || '',
          phoneNumber: data.phoneNumber || '',
          createdAt: data.createdAt || Timestamp.fromDate(new Date()),
          updatedAt: data.updatedAt,
        } as UserProfile);
      } else {
        const initialProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          name: user.displayName || '',
          photoURL: user.photoURL || '', 
          createdAt: Timestamp.fromDate(new Date()),
        };
        
        console.log('Creating new profile:', initialProfile);
        await setDoc(docRef, initialProfile);
        setProfile(initialProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    }
  };

  fetchProfile();
}, [user, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!user) {
    toast.error('You must be logged in');
    return;
  }

  setLoading(true);

  try {
    let photoURL = profile.photoURL;

    // Upload new image if selected
    if (imageFile) {
      const storageRef = ref(storage, `user_photos/${user.uid}/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      photoURL = await getDownloadURL(storageRef);
    }

    // Update Firebase Auth profile
    await updateProfile(user, {
      displayName: profile.displayName,
      photoURL: photoURL,
    });

    // Prepare update data - only include fields that have values
        const updateData: Partial<UserProfile> & { updatedAt: Timestamp } = {
          email: profile.email,
          updatedAt: Timestamp.fromDate(new Date()),
        };

    // Add optional fields only if they exist
    if (profile.displayName) {
      updateData.displayName = profile.displayName;
      updateData.name = profile.displayName; 
    }
    if (photoURL) updateData.photoURL = photoURL;
    if (profile.bio !== undefined) updateData.bio = profile.bio;
    if (profile.location !== undefined) updateData.location = profile.location;
    if (profile.phoneNumber !== undefined) updateData.phoneNumber = profile.phoneNumber;

    console.log('Updating user document:', user.uid, updateData); // Debug log

    // Update Firestore profile
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, updateData);

    // Update local state
    setProfile({ ...profile, photoURL, updatedAt: Timestamp.fromDate(new Date()) });
    setImageFile(null);
    setImagePreview(null);
    setEditing(false);
    toast.success('Profile updated successfully! 🎉');
    
    // Reload the auth state
    await user.reload();
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    console.error('Error updating profile:', error);
    console.error('Error code:', firebaseError.code);
    console.error('Error message:', firebaseError.message);
    toast.error(
      `Failed to update profile: ${
        typeof error === 'object' && error && 'message' in error
          ? (error as { message?: string }).message
          : String(error)
      }`
    );
  } finally {
    setLoading(false);
  }
};

  const handleCancel = () => {
    setEditing(false);
    setImageFile(null);
    setImagePreview(null);
  };

  const syncWithGoogle = async () => {
  if (!user) return;
  
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      photoURL: user.photoURL || '',
      displayName: user.displayName || '',
      name: user.displayName || '',
      updatedAt: Timestamp.fromDate(new Date()),
    }, { merge: true });
    
    setProfile({ ...profile, photoURL: user.photoURL || '' });
    toast.success('Profile synced with Google!');
  } catch (error) {
    console.error('Error syncing:', error);
    toast.error('Failed to sync profile');
  }
};

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto my-10 p-6 sm:p-8 bg-white/95 dark:bg-zinc-800/95 rounded-xl shadow-xl backdrop-blur-sm border border-zinc-200 dark:border-zinc-700">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#573a1c] dark:text-amber-200 mb-2">
          My Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account information
        </p>
      </div>

      {/* Profile Picture & Basic Info */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative mb-4">
          {imagePreview || profile.photoURL ? (
            <img
              src={imagePreview || profile.photoURL || ''}
              alt={profile.displayName || 'User'}
              className="w-32 h-32 rounded-full object-cover border-4 border-[#8c5628] dark:border-amber-600 shadow-lg"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-linear-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-600 flex items-center justify-center text-5xl border-4 border-[#8c5628] dark:border-amber-600 shadow-lg">
              👤
            </div>
          )}

          {editing && (
            <label
              htmlFor="profile-photo"
              className="absolute bottom-0 right-0 bg-[#8c5628] dark:bg-amber-700 text-white p-2 rounded-full cursor-pointer hover:bg-[#6d4320] dark:hover:bg-amber-600 transition-colors shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input
                id="profile-photo"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                title="Upload profile photo"
                aria-label="Upload profile photo"
                placeholder="Upload profile photo"
              />
            </label>
          )}
        </div>

        {!editing && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {profile.displayName || 'Anonymous User'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{profile.email}</p>
          </>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6" aria-label="User profile form">
        {/* Display Name */}
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Display Name
          </label>
          {editing ? (
            <input
              id="displayName"
              type="text"
              value={profile.displayName || ''}
              onChange={e => setProfile({ ...profile, displayName: e.target.value })}
              placeholder="Enter your name"
              maxLength={50}
              className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500"
            />
          ) : (
            <p className="text-gray-900 dark:text-gray-100 bg-zinc-50 dark:bg-zinc-700/50 px-4 py-2.5 rounded-lg">
              {profile.displayName || 'Not set'}
            </p>
          )}
        </div>

        {/* Email (Read-only) */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={profile.email}
            disabled
            className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-700/50 text-gray-600 dark:text-gray-400 rounded-lg cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Email cannot be changed
          </p>
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Bio
          </label>
          {editing ? (
            <>
              <textarea
                id="bio"
                value={profile.bio || ''}
                onChange={e => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                maxLength={200}
                rows={4}
                className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500 resize-y"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {profile.bio?.length || 0}/200 characters
              </p>
            </>
          ) : (
            <p className="text-gray-900 dark:text-gray-100 bg-zinc-50 dark:bg-zinc-700/50 px-4 py-2.5 rounded-lg whitespace-pre-wrap">
              {profile.bio || 'No bio added yet'}
            </p>
          )}
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Location
          </label>
          {editing ? (
            <input
              id="location"
              type="text"
              value={profile.location || ''}
              onChange={e => setProfile({ ...profile, location: e.target.value })}
              placeholder="City, Country"
              maxLength={100}
              className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500"
            />
          ) : (
            <p className="text-gray-900 dark:text-gray-100 bg-zinc-50 dark:bg-zinc-700/50 px-4 py-2.5 rounded-lg">
              {profile.location || 'Not set'}
            </p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Phone Number (Optional)
          </label>
          {editing ? (
            <input
              id="phoneNumber"
              type="tel"
              value={profile.phoneNumber || ''}
              onChange={e => setProfile({ ...profile, phoneNumber: e.target.value })}
              placeholder="+44 (7000) 123-456"
              maxLength={20}
              className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500"
            />
          ) : (
            <p className="text-gray-900 dark:text-gray-100 bg-zinc-50 dark:bg-zinc-700/50 px-4 py-2.5 rounded-lg">
              {profile.phoneNumber || 'Not set'}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 pt-4">
          <div className="flex gap-4">
            {editing ? (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 px-6 py-3 rounded-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                // Add this button in your JSX (temporary, for debugging)
                <button
                  type="button"
                  onClick={syncWithGoogle}
                  className="w-full px-6 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  🔄 Sync with Google Account
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
                      Saving...
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="w-full px-6 py-3 rounded-lg font-semibold text-white bg-[#8c5628] dark:bg-amber-700 hover:bg-[#6d4320] dark:hover:bg-amber-600 transition-colors shadow-md"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Quick Navigation Buttons */}
          {!editing && (
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => navigate('/add-dog')}
                className="px-6 py-3 rounded-lg font-medium text-[#8c5628] dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors flex items-center justify-center gap-2"
              >
                <span>🐕</span> Add a Dog
              </button>
              <button
                type="button"
                onClick={() => navigate('/dogs')}
                className="px-6 py-3 rounded-lg font-medium text-[#8c5628] dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors flex items-center justify-center gap-2"
              >
                <span>🔍</span> Browse Dogs
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Account Info */}
      <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Account Information
        </h3>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>
            <span className="font-medium">User ID:</span>{' '}
            <code className="bg-zinc-100 dark:bg-zinc-700 px-2 py-1 rounded text-xs">{user.uid}</code>
          </p>
          <p>
            <span className="font-medium">Member since:</span>{' '}
            {user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;