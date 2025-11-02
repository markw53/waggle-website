// src/components/Loading.tsx
interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ 
  message = 'Loading...', 
  fullScreen = true 
}) => {
  const containerClass = fullScreen 
    ? 'flex flex-col items-center justify-center min-h-screen'
    : 'flex flex-col items-center justify-center py-12';

  return (
    <div className={containerClass} role="status">
      <div 
        className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8c5628] dark:border-amber-500 mb-4"
        aria-hidden="true"
      ></div>
      <p className="text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  );
};

export default Loading;