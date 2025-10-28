import { useState } from 'react';
import { useDogs } from '../hooks/useDogs';
import { Dog } from '../types/dog';
// import { Timestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

// Form type (without Firestore-specific fields)
type DogForm = Omit<Dog, 'id' | 'createdAt' | 'ownerId'>;

const DogManager: React.FC = () => {
  const { dogs, loading, updateDog, deleteDog } = useDogs();
  
  const initialFormState: DogForm = {
    name: '',
    breed: '',
    age: 1,
    gender: 'Male',
    bio: '',
    imageUrl: null,
  };

  const [form, setForm] = useState<DogForm>(initialFormState);
  const [editId, setEditId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name.trim() || !form.breed.trim()) {
      toast.error('Name and breed are required.');
      return;
    }

    try {
      if (editId) {
        await updateDog(editId, form);
        toast.success('Dog updated! 🐕');
        setEditId(null);
      }
      setForm(initialFormState);
    } catch (err: unknown) {
      console.error('Error updating dog:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to update dog.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this dog? This action cannot be undone.')) {
      try {
        await deleteDog(id);
        toast.success('Dog deleted.');
      } catch (err) {
        console.error('Error deleting dog:', err);
        toast.error('Failed to delete dog.');
      }
    }
  };

  const handleEdit = (dog: Dog) => {
    setForm({
      name: dog.name,
      breed: dog.breed,
      age: dog.age,
      gender: dog.gender,
      bio: dog.bio || '',
      imageUrl: dog.imageUrl,
    });
    setEditId(dog.id);
  };

  const handleCancel = () => {
    setEditId(null);
    setForm(initialFormState);
  };

  return (
    <div className="max-w-4xl mx-auto my-10 p-6 sm:p-8 bg-white/95 dark:bg-zinc-800/95 rounded-xl shadow-xl backdrop-blur-sm border border-zinc-200 dark:border-zinc-700">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#573a1c] dark:text-amber-200 mb-2">
          Manage Your Dogs 🐕
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Edit or delete your registered dogs
        </p>
      </div>

      {/* Edit Form (only shows when editing) */}
      {editId && (
        <form 
          onSubmit={handleSubmit} 
          className="mb-8 p-6 bg-amber-50 dark:bg-amber-900/20 rounded-lg border-2 border-amber-300 dark:border-amber-700"
          aria-label="Edit dog form"
        >
          <h3 className="text-lg font-semibold text-[#573a1c] dark:text-amber-200 mb-4">
            Editing: {form.name}
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label htmlFor="edit-name" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                Name *
              </label>
              <input
                id="edit-name"
                type="text"
                placeholder="Dog's name"
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500"
              />
            </div>

            {/* Breed */}
            <div>
              <label htmlFor="edit-breed" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                Breed *
              </label>
              <input
                id="edit-breed"
                type="text"
                placeholder="Breed"
                required
                value={form.breed}
                onChange={e => setForm(f => ({ ...f, breed: e.target.value }))}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500"
              />
            </div>

            {/* Age */}
            <div>
              <label htmlFor="edit-age" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                Age (years) *
              </label>
              <input
                id="edit-age"
                type="number"
                min="0"
                max="25"
                required
                value={form.age}
                onChange={e => setForm(f => ({ ...f, age: Number(e.target.value) }))}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500"
              />
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="edit-gender" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                Gender *
              </label>
              <select
                id="edit-gender"
                value={form.gender}
                onChange={e => setForm(f => ({ ...f, gender: e.target.value as 'Male' | 'Female' }))}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* Image URL */}
            <div className="sm:col-span-2">
              <label htmlFor="edit-image" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                Image URL (optional)
              </label>
              <input
                id="edit-image"
                type="url"
                placeholder="https://example.com/dog-image.jpg"
                value={form.imageUrl || ''}
                onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value || null }))}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500"
              />
            </div>

            {/* Bio */}
            <div className="sm:col-span-2">
              <label htmlFor="edit-bio" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                Bio/Description
              </label>
              <textarea
                id="edit-bio"
                placeholder="Tell us about your dog..."
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                rows={3}
                maxLength={160}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500 resize-y"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {form.bio.length}/160 characters
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-2 bg-[#8c5628] dark:bg-amber-700 text-white rounded-lg hover:bg-[#6d4320] dark:hover:bg-amber-600 transition-colors font-medium"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-6 py-2 bg-gray-300 dark:bg-zinc-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-zinc-500 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Dogs List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12" role="status">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8c5628] dark:border-amber-500 mb-4" aria-hidden="true"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your dogs...</p>
          </div>
        ) : dogs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4" aria-hidden="true">🐕</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Dogs Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You haven't added any dogs yet.
            </p>
            <button
              onClick={() => window.location.href = '/add-dog'}
              className="px-6 py-3 bg-[#8c5628] dark:bg-amber-700 text-white rounded-lg hover:bg-[#6d4320] dark:hover:bg-amber-600 transition-colors font-medium"
            >
              Add Your First Dog
            </button>
          </div>
        ) : (
          dogs.map((dog) => (
            <div
              key={dog.id}
              className="border border-zinc-200 dark:border-zinc-700 p-5 rounded-lg bg-white dark:bg-zinc-800 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* Dog Image */}
                <div className="flex-shrink-0">
                  {dog.imageUrl ? (
                    <img
                      src={dog.imageUrl}
                      alt={dog.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#8c5628] dark:border-amber-600"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-600 flex items-center justify-center text-2xl">
                      🐕
                    </div>
                  )}
                </div>

                {/* Dog Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-[#573a1c] dark:text-amber-200">
                    {dog.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {dog.breed} • {dog.age} {dog.age === 1 ? 'year' : 'years'} • {dog.gender}
                  </p>
                  {dog.bio && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                      {dog.bio}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleEdit(dog)}
                    aria-label={`Edit ${dog.name}`}
                    className="px-4 py-1.5 rounded-lg bg-[#8c5628] dark:bg-amber-700 text-white text-sm hover:bg-[#6d4320] dark:hover:bg-amber-600 transition-colors font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(dog.id)}
                    aria-label={`Delete ${dog.name}`}
                    className="px-4 py-1.5 rounded-lg bg-red-600 dark:bg-red-700 text-white text-sm hover:bg-red-700 dark:hover:bg-red-600 transition-colors font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DogManager;