import React, { useEffect, useState, useContext } from 'react';
import { CartContext } from '../../Context/CartContext';
import { AuthContext } from '../../Context/AuthContext';
import { useToast } from '../../components/ToastContainer';
import { getFoodImageSrc, handleImageError } from '../../utils/imageUtils';
import { FiSearch, FiFilter, FiTruck, FiClock, FiStar, FiHeart, FiPlus, FiMinus, FiX, FiEye } from 'react-icons/fi';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Products = () => {
  const { addToCart, getCartItemsCount } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { showSuccess, showError } = useToast();
  
  // State management
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState(['All']);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [dietaryFilter, setDietaryFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState(0);

  // Fetch products from backend
  useEffect(() => {
    fetchProducts();
  }, []);

  // Apply filters whenever filter states change
  useEffect(() => {
    applyFilters();
  }, [products, selectedCategory, searchTerm, sortBy, dietaryFilter, ratingFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE}/api/products`);
      const productsData = response.data;
      
      setProducts(productsData);
      
      // Extract unique categories
      const uniqueCategories = ['All', ...new Set(productsData.map(product => product.category))];
      setCategories(uniqueCategories);
      
      console.log(`✅ Fetched ${productsData.length} products from backend`);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setError('Failed to load products from server');
      showError && showError('Failed to load products');
      setProducts([]);
      setCategories(['All']);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Dietary filter
    if (dietaryFilter === 'Vegetarian') {
      filtered = filtered.filter(product => product.isVegetarian);
    } else if (dietaryFilter === 'Non-Vegetarian') {
      filtered = filtered.filter(product => !product.isVegetarian);
    }

    // Rating filter
    if (ratingFilter > 0) {
      filtered = filtered.filter(product => {
        const rating = product.rating?.average || product.rating || 0;
        return rating >= ratingFilter;
      });
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => {
          const ratingA = b.rating?.average || b.rating || 0;
          const ratingB = a.rating?.average || a.rating || 0;
          return ratingA - ratingB;
        });
        break;
      case 'popular':
        filtered.sort((a, b) => {
          const reviewsA = b.rating?.count || b.reviews || 0;
          const reviewsB = a.rating?.count || a.reviews || 0;
          return reviewsA - reviewsB;
        });
        break;
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredProducts(filtered);
  };

  const handleAddToCart = async (product, quantity = 1) => {
    try {
      await addToCart(product, quantity);
      showSuccess && showSuccess(`${product.name} added to cart!`);
    } catch (error) {
      showError && showError('Failed to add to cart');
    }
  };

  const toggleFavorite = (productId) => {
    setFavorites(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const getQuantity = (productId) => quantities[productId] || 1;

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity >= 1) {
      setQuantities(prev => ({ ...prev, [productId]: newQuantity }));
    }
  };

  const clearAllFilters = () => {
    setSelectedCategory('All');
    setSearchTerm('');
    setSortBy('name');
    setDietaryFilter('All');
    setRatingFilter(0);
    setShowFilters(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading delicious menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Enhanced Hero Section */}
      <div className="relative bg-gradient-to-r from-orange-400 via-red-500 to-pink-600 text-white py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-y-12"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fadeIn">
            🍽️ Our Menu
          </h1>
          <p className="text-xl md:text-2xl opacity-90 mb-8 animate-slideUp delay-200 max-w-3xl mx-auto">
            Discover amazing flavors from around the world, crafted with love and fresh ingredients
          </p>
          
          {/* Cart Status */}
          {getCartItemsCount && getCartItemsCount() > 0 && (
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4 mb-6 max-w-md mx-auto animate-slideUp delay-300 border border-white border-opacity-30">
              <p className="text-lg font-semibold">
                🛒 {getCartItemsCount()} items in your cart
              </p>
              <button
                onClick={() => window.location.href = '/cart'}
                className="mt-2 bg-white text-orange-500 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                View Cart
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter Controls */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-2xl mx-auto">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                placeholder="Search for delicious food..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Filter Toggle */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg"
              >
                <FiFilter />
                <span>Advanced Filters</span>
              </button>
              
              {(selectedCategory !== 'All' || searchTerm || dietaryFilter !== 'All' || ratingFilter > 0) && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <FiX size={16} />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>
            
            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              {filteredProducts.length} of {products.length} items
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200 space-y-6">
              {/* Categories */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-full transition-all duration-200 ${
                        selectedCategory === category
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg transform scale-105'
                          : 'bg-white text-gray-700 border border-gray-300 hover:border-orange-300 hover:bg-orange-50'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dietary Preferences */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Dietary Preference</h3>
                <div className="flex flex-wrap gap-2">
                  {['All', 'Vegetarian', 'Non-Vegetarian'].map(diet => (
                    <button
                      key={diet}
                      onClick={() => setDietaryFilter(diet)}
                      className={`px-4 py-2 rounded-full transition-all duration-200 ${
                        dietaryFilter === diet
                          ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                          : 'bg-white text-gray-700 border border-gray-300 hover:border-green-300 hover:bg-green-50'
                      }`}
                    >
                      {diet === 'Vegetarian' ? '🥬 ' : diet === 'Non-Vegetarian' ? '🍗 ' : '🍽️ '}
                      {diet}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Minimum Rating</h3>
                <div className="flex flex-wrap gap-2">
                  {[0, 3, 4, 4.5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setRatingFilter(rating)}
                      className={`flex items-center space-x-1 px-4 py-2 rounded-full transition-all duration-200 ${
                        ratingFilter === rating
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'
                          : 'bg-white text-gray-700 border border-gray-300 hover:border-yellow-300 hover:bg-yellow-50'
                      }`}
                    >
                      <FiStar className={rating > 0 ? 'fill-current' : ''} />
                      <span>{rating === 0 ? 'Any' : `${rating}+`}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Sort By</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'name', label: 'Name' },
                    { value: 'price-low', label: 'Price: Low to High' },
                    { value: 'price-high', label: 'Price: High to Low' },
                    { value: 'rating', label: 'Highest Rated' },
                    { value: 'popular', label: 'Most Popular' }
                  ].map(sort => (
                    <button
                      key={sort.value}
                      onClick={() => setSortBy(sort.value)}
                      className={`px-4 py-2 rounded-full transition-all duration-200 ${
                        sortBy === sort.value
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                          : 'bg-white text-gray-700 border border-gray-300 hover:border-purple-300 hover:bg-purple-50'
                      }`}
                    >
                      {sort.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-8">
            <div className="flex items-center space-x-2">
              <span>⚠️</span>
              <span>{error}</span>
              <button
                onClick={fetchProducts}
                className="ml-auto px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">No items found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
                isFavorite={favorites.includes(product._id)}
                onToggleFavorite={toggleFavorite}
                quantity={getQuantity(product._id)}
                onUpdateQuantity={updateQuantity}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Product Card Component
const ProductCard = ({ product, onAddToCart, isFavorite, onToggleFavorite, quantity, onUpdateQuantity }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const rating = product.rating?.average || product.rating || 0;
  const reviewCount = product.rating?.count || product.reviews || 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse"></div>
        )}
        <img
          src={getFoodImageSrc(product)}
          alt={product.name}
          className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => handleImageError(e, product)}
        />
        
        {/* Favorite Button */}
        <button
          onClick={() => onToggleFavorite(product._id)}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
            isFavorite
              ? 'bg-red-500 text-white transform scale-110'
              : 'bg-white bg-opacity-80 text-gray-600 hover:bg-opacity-100'
          }`}
        >
          <FiHeart className={isFavorite ? 'fill-current' : ''} size={18} />
        </button>

        {/* Dietary Badge */}
        {product.isVegetarian && (
          <div className="absolute top-3 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            🥬 Veg
          </div>
        )}

        {/* Stock Status */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title and Rating */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <FiStar className="text-yellow-400 fill-current" size={16} />
              <span className="text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
            </div>
            <span className="text-sm text-gray-500">({reviewCount} reviews)</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>

        {/* Delivery Info */}
        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <FiClock size={14} />
            <span>25-30 min</span>
          </div>
          <div className="flex items-center space-x-1">
            <FiTruck size={14} />
            <span>Free delivery</span>
          </div>
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
            )}
          </div>

          {product.inStock ? (
            <div className="flex items-center space-x-2">
              {/* Quantity Selector */}
              <div className="flex items-center bg-gray-100 rounded-lg">
                <button
                  onClick={() => onUpdateQuantity(product._id, quantity - 1)}
                  className="p-2 hover:bg-gray-200 rounded-l-lg transition-colors"
                  disabled={quantity <= 1}
                >
                  <FiMinus size={14} />
                </button>
                <span className="px-3 py-2 text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => onUpdateQuantity(product._id, quantity + 1)}
                  className="p-2 hover:bg-gray-200 rounded-r-lg transition-colors"
                >
                  <FiPlus size={14} />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={() => onAddToCart(product, quantity)}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2"
              >
                <FiPlus size={16} />
                <span>Add</span>
              </button>
            </div>
          ) : (
            <button
              disabled
              className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed"
            >
              Out of Stock
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
