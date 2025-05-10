// src/components/DogCard.tsx
import { Dog } from '../types/dog';
import './DogCard.css';

export const DogCard: React.FC<{ dog: Dog }> = ({ dog }) => (
  <div className="dogcard">
    <div className="dogcard-header">
      <img src={dog.photos?.[0]} alt={dog.name} className="dogcard-photo" />
      <div>
        <h3>{dog.name}</h3>
        <p>{dog.breed}, {dog.age}y, {dog.gender}</p>
      </div>
    </div>
    <div className="dogcard-body">
      <p><b>Traits:</b> {dog.traits.size}, {dog.traits.energy} energy, friendliness: {dog.traits.friendliness}</p>
      <p>{dog.description}</p>
    </div>
  </div>
);

export default DogCard;