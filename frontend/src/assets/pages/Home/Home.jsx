import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../../Context/CartContext';
import productService from '../../services/productService';
import CategoryFilter from '../../components/CategoryFilter';
import { SkeletonLoader } from '../../components/Loader';
import HeroSection from '../../components/HeroSection';
import { getFoodImageSrc, handleImageError } from '../../utils/imageUtils';
import { FiPlus, FiStar, FiClock, FiTruck, FiHeart, FiEye, FiShield, FiZap, FiUsers, FiAward } from 'react-icons/fi';

const Home = () => {
  const { addToCart } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await productService.getAllProducts();
        // Ensure data is an array
        const productsArray = Array.isArray(data) ? data : [];
        setProducts(productsArray);
        
        // Extract unique categories from products
        const uniqueCategories = [...new Set(productsArray.map(product => product.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setError('Failed to fetch products. Please try again later.');
        setProducts([]); // Ensure products is always an array
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = selectedCategory === 'All' 
    ? (Array.isArray(products) ? products : [])
    : (Array.isArray(products) ? products.filter(product => product.category === selectedCategory) : []);

  const handleAddToCart = (product) => {
    addToCart(product);
    setSuccess(`${product.name} added to cart!`);
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleFilterReset = () => {
    setSelectedCategory('All');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <HeroSection />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Success/Error Messages */}
        {success && (
          <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-slideIn">
            <div className="flex items-center space-x-2">
              <span>✅</span>
              <span>{success}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-8">
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          </div>
        )}

        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Our Menu
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover delicious food from our curated selection of restaurants
          </p>
        </div>

        {/* Enhanced Category Filter */}
        <div className="mb-8">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onFilterReset={handleFilterReset}
          />
        </div>

        {/* Products Section */}
        {loading ? (
          <div className="mb-12">
            <SkeletonLoader count={8} type="card" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🍽️</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              {selectedCategory === 'All' 
                ? "We're working on adding more delicious options!" 
                : `No items found in "${selectedCategory}" category.`
              }
            </p>
            {selectedCategory !== 'All' && (
              <button
                onClick={handleFilterReset}
                className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                View All Products
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{filteredProducts.length}</span> 
                {selectedCategory !== 'All' && (
                  <span> {selectedCategory.toLowerCase()}</span>
                )} items
              </p>
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                <FiTruck size={16} />
                <span>Free delivery over $25</span>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  animationDelay={index * 0.1}
                />
              ))}
            </div>
          </>
        )}

        {/* Why Choose Us Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Us?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're committed to delivering the best food experience with quality, speed, and exceptional service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Fast Delivery */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <FiZap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-gray-600">
                Get your food delivered hot and fresh in under 30 minutes with our lightning-fast delivery service.
              </p>
            </div>

            {/* Quality Food */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <FiAward className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Premium Quality</h3>
              <p className="text-gray-600">
                We use only the freshest ingredients and work with top-rated restaurants to ensure exceptional quality.
              </p>
            </div>

            {/* Trusted Service */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <FiShield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Trusted & Secure</h3>
              <p className="text-gray-600">
                Safe and secure payments with 100% food safety standards. Your trust is our top priority.
              </p>
            </div>

            {/* Happy Customers */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <FiUsers className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">10K+ Happy Customers</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Join thousands of satisfied customers who trust us for their daily food cravings.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-12 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">10K+</div>
                <div className="text-gray-600 dark:text-gray-400">Happy Customers</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">500+</div>
                <div className="text-gray-600 dark:text-gray-400">Menu Items</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">25 Min</div>
                <div className="text-gray-600 dark:text-gray-400">Average Delivery</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">4.8★</div>
                <div className="text-gray-600 dark:text-gray-400">Customer Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Can't find what you're looking for?</h3>
          <p className="text-orange-100 mb-6">
            Browse our complete menu or contact us for special requests
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-orange-500 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              <FiEye className="mr-2" size={18} />
              View Full Menu
            </Link>
            <Link
              to="/helpdesk"
              className="inline-flex items-center justify-center px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product, onAddToCart, animationDelay }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all duration-300 overflow-hidden group animate-fadeIn"
      style={{ 
        animationDelay: `${animationDelay}s`,
        animationFillMode: 'forwards' 
      }}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={getFoodImageSrc(product)}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => handleImageError(e, product)}
        />
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300">
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`p-2 rounded-full backdrop-blur-sm ${
                isLiked 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white bg-opacity-80 text-gray-600 hover:text-red-500'
              } transition-colors`}
            >
              <FiHeart size={16} fill={isLiked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 text-gray-700 dark:text-gray-300 text-xs font-medium px-2 py-1 rounded-full">
            {product.category}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">
          {product.name}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Rating & Time */}
        <div className="flex items-center space-x-4 mb-3 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <FiStar className="text-yellow-400 dark:text-yellow-300" size={14} />
            <span>4.5</span>
          </div>
          <div className="flex items-center space-x-1">
            <FiClock size={14} />
            <span>25-30 min</span>
          </div>
        </div>

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
            ₹{product.price}
          </span>
          
          <button
            onClick={() => onAddToCart(product)}
            className="inline-flex items-center space-x-1 bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <FiPlus size={14} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
