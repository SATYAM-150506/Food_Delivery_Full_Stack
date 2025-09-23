import React, { useState } from 'react';
import { FiFilter, FiX } from 'react-icons/fi';

const CategoryFilter = ({ categories = [], selectedCategory, onCategoryChange, onFilterReset }) => {
  const [isOpen, setIsOpen] = useState(false);

  const categoryEmojis = {
    'All': '🍽️',
    'Pizza': '🍕',
    'Burger': '🍔',
    'Sushi': '🍣',
    'Chinese': '🥢',
    'Indian': '🍛',
    'Italian': '🍝',
    'Mexican': '🌮',
    'Thai': '🍜',
    'Desserts': '🍰',
    'Beverages': '🥤',
    'Drinks': '🥤',
    'Healthy': '🥗',
    'Fast Food': '🍟',
    'BBQ': '🍖',
    'Seafood': '🦐',
    'Snacks': '🍿'
  };

  const defaultCategories = [
    'All',
    'Pizza', 
    'Burger',
    'Drinks',
    'Desserts',
    'Chinese',
    'Indian',
    'Snacks'
  ];

  const handleCategorySelect = (category) => {
    onCategoryChange(category);
    setIsOpen(false);
  };

  const allCategories = categories.length > 0 ? ['All', ...categories] : defaultCategories;

  return (
    <div className="relative">
      {/* Desktop Filter */}
      <div className="hidden md:flex items-center space-x-2 mb-6">
        <div className="flex items-center space-x-1 text-gray-600">
          <FiFilter size={16} />
          <span className="text-sm font-medium">Filter by category:</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {allCategories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-orange-500 dark:bg-orange-600 text-white shadow-lg transform scale-105'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400'
              }`}
            >
              <span className="text-lg">{categoryEmojis[category] || '🍴'}</span>
              <span>{category}</span>
            </button>
          ))}
        </div>

        {selectedCategory !== 'All' && onFilterReset && (
          <button
            onClick={onFilterReset}
            className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            <FiX size={16} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Mobile Filter */}
      <div className="md:hidden mb-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-between w-full px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm ${
            isOpen ? 'border-orange-300' : ''
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg">{categoryEmojis[selectedCategory] || '🍴'}</span>
            <span className="font-medium text-gray-700">{selectedCategory}</span>
          </div>
          <FiFilter className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} size={16} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
            {allCategories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className={`flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors ${
                  selectedCategory === category ? 'bg-orange-100 text-orange-600' : 'text-gray-700'
                }`}
              >
                <span className="text-lg">{categoryEmojis[category] || '🍴'}</span>
                <span className="font-medium">{category}</span>
                {selectedCategory === category && (
                  <span className="ml-auto text-orange-500">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results Count */}
      {selectedCategory !== 'All' && (
        <div className="flex items-center justify-between mb-4 p-3 bg-orange-50 rounded-lg">
          <span className="text-sm text-orange-700">
            Showing <span className="font-semibold">{selectedCategory}</span> items
          </span>
          {onFilterReset && (
            <button
              onClick={onFilterReset}
              className="text-sm text-orange-600 hover:text-orange-800 font-medium"
            >
              View All
            </button>
          )}
        </div>
      )}

      {/* Quick Filter Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {['Popular', 'New', 'Trending', 'Under $15'].map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full hover:bg-orange-100 hover:text-orange-600 cursor-pointer transition-colors"
          >
            {tag === 'Popular' && '🔥'}
            {tag === 'New' && '✨'}
            {tag === 'Trending' && '📈'}
            {tag === 'Under $15' && '💰'}
            <span className="ml-1">{tag}</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
