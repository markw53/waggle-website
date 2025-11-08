import DogsMap from '@/components/DogsMap';

export default function DogsMapPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Find Dogs Near You
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Discover breeding partners in your area
      </p>

      <DogsMap />
    </div>
  );
}