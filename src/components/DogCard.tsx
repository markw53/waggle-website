import { Link } from 'react-router-dom';
import type { Dog } from '@/types/dog';

export const DogCard: React.FC<{ dog: Dog }> = ({ dog }) => (
  <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
    <div className="flex items-start gap-4">
      {/* Dog Image */}
      <div className="shrink-0">
        {dog.imageUrl ? (
          <img
            src={dog.imageUrl}
            alt={`${dog.name} the ${dog.breed}`}
            className="w-20 h-20 rounded-full object-cover border-2 border-[#8c5628] dark:border-amber-600"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-linear-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-600 flex items-center justify-center text-3xl">
            🐕
          </div>
        )}
      </div>

      {/* Dog Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-xl font-bold text-[#573a1c] dark:text-amber-200 mb-1">
          {dog.name}
        </h3>
        <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
          <span className="inline-flex items-center gap-1">
            🐾 {dog.breed}
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            🎂 {dog.age} {dog.age === 1 ? 'year' : 'years'}
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            {dog.gender === 'Male' ? '♂️' : '♀️'} {dog.gender}
          </span>
        </div>

        {/* Bio */}
        {dog.bio && (
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
            {dog.bio}
          </p>
        )}
      </div>
    </div>

    {/* Optional: View Details Button */}
    <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
      <Link
        to={`/dogs/${dog.id}`}
        className="text-sm text-[#8c5628] dark:text-amber-400 hover:text-[#6d4320] dark:hover:text-amber-300 font-medium transition-colors"
      >
        View Full Profile →
      </Link>
    </div>
  </div>
);

export default DogCard;