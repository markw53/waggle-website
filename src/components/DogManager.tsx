// src/components/DogManager.tsx
import { useState } from 'react';
import { useDogs } from '../hooks/useDogs';
import toast from 'react-hot-toast';
import './DogManager.css';

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
        await addDog(form);
        setEditId(null);
      } else {
        await addDog(form);
        toast.success('Dog added!');
      }
      setForm({ ...form, name: '', breed: '', age: 1, gender: 'male', photos: [''] });
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('An unexpected error occurred.');
      }
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
    <div className="dog-crud-manager">
      <form onSubmit={handleSubmit} className="dog-form">
        <input placeholder="Name" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <input placeholder="Breed" required value={form.breed} onChange={e => setForm(f => ({ ...f, breed: e.target.value }))} />
        <input placeholder="Age" required type="number" value={form.age} onChange={e => setForm(f => ({ ...f, age: Number(e.target.value) }))} />
        <label htmlFor="dog-gender-select">Gender</label>
        <select
          id="dog-gender-select"
          value={form.gender}
          onChange={e => setForm(f => ({ ...f, gender: e.target.value as 'male' | 'female' }))}
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <input placeholder="Photo URL" value={form.photos[0]} onChange={e => setForm(f => ({ ...f, photos: [e.target.value] }))} />
        <input placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        {/* Add more fields as needed */}
        <button type="submit">{editId ? 'Update Dog' : 'Add Dog'}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setForm({ ...form, name: '', breed: '', age: 1, gender: 'male', photos: [''] }); }}>Cancel</button>}
      </form>
      <div>
        {loading ? <div>Loading...</div> :
          dogs.map((dog) =>
            <div key={dog.id} className="dog-card">
              <strong>{dog.name}</strong> ({dog.breed}, {dog.age}y, {dog.gender})
              {dog.photos?.[0] && <img src={dog.photos[0]} alt="" className="dog-photo" />}
              <br />
              <small>{dog.description}</small>
              <div>
                <button className="dog-btn" onClick={() => handleEdit(dog)}>Edit</button>
                <button className="dog-btn" onClick={() => handleDelete(dog.id!)}>Delete</button>
              </div>
            </div>)
        }
      </div>
    </div>
  );
};

export default DogManager;