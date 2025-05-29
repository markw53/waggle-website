import { useState } from 'react';
import { useDogs } from '../hooks/useDogs';
import toast from 'react-hot-toast';

const DogManager: React.FC = () => {
  type Dog = {
    id?: string;
    name: string;
    breed: string;
    age: number;
    gender: 'male' | 'female';
    photos: string[];
    description?: string;
    traits: { size: 'small' | 'medium' | 'large'; energy: 'low' | 'medium' | 'high'; friendliness: 'low' | 'medium' | 'high' };
    medicalInfo: { vaccinated: boolean; neutered: boolean; lastCheckup: Date };
  };

  const { dogs, loading, addDog, updateDog, deleteDog } = useDogs();
  const [form, setForm] = useState<Dog>({
    name: '', breed: '', age: 1, gender: 'male', photos: [''],
    description: '', traits: { size: 'medium', energy: 'medium', friendliness: 'medium' }, medicalInfo: {
      vaccinated: true, neutered: false, lastCheckup: new Date()
    }
  });
  const [editId, setEditId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateDog(editId, form);
        setEditId(null);
      } else {
        await addDog(form);
        toast.success('Dog added!');
      }
      setForm({ ...form, name: '', breed: '', age: 1, gender: 'male', photos: [''], description: '' });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'An unexpected error occurred.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this dog?')) {
      await deleteDog(id);
      toast.success('Dog deleted!');
    }
  };

  const handleEdit = (dog: Dog) => {
    setForm({
      name: dog.name, breed: dog.breed, age: dog.age, gender: dog.gender, photos: dog.photos,
      description: dog.description || '', traits: dog.traits, medicalInfo: dog.medicalInfo
    });
    setEditId(dog.id ?? null);
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-white dark:bg-neutral-900 rounded-xl shadow-lg flex flex-col items-center">
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 mb-6">
        <input
          className="p-2 border border-orange-300 rounded bg-[#f9f4f1] text-base"
          placeholder="Name" required value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        />
        <input
          className="p-2 border border-orange-300 rounded bg-[#f9f4f1] text-base"
          placeholder="Breed" required value={form.breed}
          onChange={e => setForm(f => ({ ...f, breed: e.target.value }))}
        />
        <input
          type="number"
          className="p-2 border border-orange-300 rounded bg-[#f9f4f1] text-base"
          placeholder="Age" required value={form.age}
          onChange={e => setForm(f => ({ ...f, age: Number(e.target.value) }))}
        />
        <select
          id="dog-gender-select"
          value={form.gender}
          className="p-2 border border-orange-300 rounded bg-[#f9f4f1] text-base"
          onChange={e => setForm(f => ({ ...f, gender: e.target.value as 'male' | 'female' }))}
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <input
          className="p-2 border border-orange-300 rounded bg-[#f9f4f1] text-base"
          placeholder="Photo URL" value={form.photos[0]}
          onChange={e => setForm(f => ({ ...f, photos: [e.target.value] }))}
        />
        <input
          className="p-2 border border-orange-300 rounded bg-[#f9f4f1] text-base w-full"
          placeholder="Description" value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-orange-700 text-white rounded hover:opacity-90"
        >
          {editId ? 'Update Dog' : 'Add Dog'}
        </button>
        {editId && (
          <button
            type="button"
            className="px-4 py-2 bg-gray-500 text-white rounded hover:opacity-90"
            onClick={() => { setEditId(null); setForm({ ...form, name: '', breed: '', age: 1, gender: 'male', photos: [''], description: '' }); }}
          >
            Cancel
          </button>
        )}
      </form>
      <div className="w-full">
        {loading ? <div>Loading...</div> : dogs.map((dog) => (
          <div key={dog.id} className="border border-gray-300 mb-3 p-3 rounded-lg bg-[#fffdfa] shadow-sm">
            <strong>{dog.name}</strong> ({dog.breed}, {dog.age}y, {dog.gender})
            {dog.photos?.[0] && <img src={dog.photos[0]} alt="" className="inline-block align-middle max-h-10 ml-2 rounded shadow-sm" />}
            <br />
            <small className="text-gray-600">{dog.description}</small>
            <div className="mt-2">
              <button className="mr-2 px-3 py-1 rounded bg-[#573a1c] text-white text-sm hover:bg-[#a83824]" onClick={() => handleEdit(dog)}>Edit</button>
              <button className="px-3 py-1 rounded bg-[#573a1c] text-white text-sm hover:bg-[#a83824]" onClick={() => handleDelete(dog.id!)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DogManager;
