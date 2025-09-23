import React from 'react';

const Loader = ({ size = 'medium', text = 'Loading...', fullScreen = false }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8', 
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  };

  const SpinnerComponent = () => (
    <div className="flex flex-col items-center space-y-4">
      {/* Main Spinner */}
      <div className="relative">
        <div className={`${sizeClasses[size]} border-4 border-orange-200 dark:border-orange-800 rounded-full animate-spin`}>
          <div className="absolute inset-0 border-4 border-transparent border-t-orange-500 dark:border-t-orange-400 rounded-full animate-spin"></div>
        </div>
        {/* Inner dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-orange-500 dark:bg-orange-400 rounded-full animate-pulse"></div>
        </div>
      </div>
      
      {text && (
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 font-medium">{text}</p>
          <div className="flex space-x-1 mt-2">
            <div className="w-2 h-2 bg-orange-400 dark:bg-orange-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-orange-400 dark:bg-orange-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-orange-400 dark:bg-orange-500 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 bg-opacity-90 dark:bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg dark:shadow-gray-900/30">
          <SpinnerComponent />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center py-8">
      <SpinnerComponent />
    </div>
  );
};

// Food-themed loading component
const FoodLoader = ({ text = 'Preparing your order...' }) => {
  const foodEmojis = ['🍕', '🍔', '🍟', '🥤'];
  const [currentEmoji, setCurrentEmoji] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEmoji((prev) => (prev + 1) % foodEmojis.length);
    }, 500);
    return () => clearInterval(interval);
  }, [foodEmojis.length]);

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative mb-4">
        <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center animate-bounce">
          <span className="text-3xl">{foodEmojis[currentEmoji]}</span>
        </div>
        <div className="absolute inset-0 w-20 h-20 border-4 border-orange-300 rounded-full animate-spin opacity-30"></div>
      </div>
      <p className="text-gray-600 font-medium text-center">{text}</p>
      <div className="flex space-x-1 mt-3">
        <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse delay-200"></div>
        <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse delay-400"></div>
      </div>
    </div>
  );
};

// Skeleton loader for cards
const SkeletonLoader = ({ count = 3, type = 'card' }) => {
  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 p-4 animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-600 h-48 rounded-lg mb-4"></div>
            <div className="bg-gray-200 dark:bg-gray-600 h-4 rounded mb-2"></div>
            <div className="bg-gray-200 dark:bg-gray-600 h-4 rounded w-3/4 mb-4"></div>
            <div className="flex justify-between items-center">
              <div className="bg-gray-200 dark:bg-gray-600 h-6 rounded w-16"></div>
              <div className="bg-gray-200 dark:bg-gray-600 h-8 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-600 w-16 h-16 rounded-lg"></div>
            <div className="flex-1">
              <div className="bg-gray-200 dark:bg-gray-600 h-4 rounded mb-2"></div>
              <div className="bg-gray-200 dark:bg-gray-600 h-3 rounded w-2/3"></div>
            </div>
            <div className="bg-gray-200 dark:bg-gray-600 h-8 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

// Export all components
export default Loader;
export { FoodLoader, SkeletonLoader };
