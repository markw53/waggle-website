import { Dog } from '../types/dog';

export const DogCard: React.FC<{ dog: Dog }> = ({ dog }) => (
  <div className="bg-[#fffdfa] dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 p-5 rounded-lg shadow-md mb-4 max-w-md mx-auto">
    <div className="flex items-center">
      <img
        src={dog.photos?.[0]}
        alt={dog.name}
        className="w-[70px] h-[70px] rounded-lg object-cover mr-5 bg-[#ececec] dark:bg-neutral-700"
      />
      <div>
        <h3 className="text-lg font-semibold text-neutral-800 dark:text-white">{dog.name}</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          {dog.breed}, {dog.age}y, {dog.gender}
        </p>
      </div>
    </div>
    <div className="pt-4 pl-[80px] text-[0.96rem] text-neutral-700 dark:text-neutral-200">
      <p><b>Traits:</b> {dog.traits.size}, {dog.traits.energy} energy, friendliness: {dog.traits.friendliness}</p>
      <p>{dog.description}</p>
    </div>
  </div>
);

export default DogCard;
