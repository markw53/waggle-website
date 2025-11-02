// src/pages/NotFound.tsx
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes'; // ✅ Added

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-[#8c5628] dark:text-amber-500 mb-4">
            404
          </h1>
          <div className="text-6xl mb-4">🐕</div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Looks like this dog ran away! The page you're looking for doesn't exist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(ROUTES.HOME)} // ✅ Updated
            className="px-8 py-3 bg-[#8c5628] dark:bg-amber-700 text-white rounded-lg hover:bg-[#6d4320] dark:hover:bg-amber-600 transition-colors font-semibold shadow-md"
          >
            Go Home
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors font-semibold"
          >
            Go Back
          </button>
        </div>

        <div className="mt-12">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Popular pages:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => navigate(ROUTES.DOGS)} // ✅ Updated
              className="px-4 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              Browse Dogs
            </button>
            <button
              onClick={() => navigate(ROUTES.ADD_DOG)} // ✅ Updated
              className="px-4 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              Add a Dog
            </button>
            <button
              onClick={() => navigate(ROUTES.PROFILE)} // ✅ Updated
              className="px-4 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              My Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;