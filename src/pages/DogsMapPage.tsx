import DogsMap from '@/components/DogsMap';

export default function DogsMapPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-200 dark:border-zinc-700">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🗺️ Find Dogs Near You
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover breeding partners in your area
        </p>
      </div>

      <DogsMap />
    </div>
  );
}