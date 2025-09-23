import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlay, FiStar, FiTruck, FiUser } from 'react-icons/fi';

const HeroSection = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  
  const features = [
    { icon: FiTruck, text: "Fast Delivery in 30 mins", color: "text-green-500" },
    { icon: FiStar, text: "5-star rated restaurants", color: "text-yellow-500" },
    { icon: FiUser, text: "10k+ happy customers", color: "text-blue-500" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-orange-200 dark:bg-orange-800 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-red-200 dark:bg-red-800 rounded-full opacity-20 animate-bounce delay-1000"></div>
        <div className="absolute bottom-32 left-20 w-24 h-24 bg-pink-200 dark:bg-pink-800 rounded-full opacity-20 animate-bounce delay-500"></div>
        <div className="absolute bottom-20 right-16 w-18 h-18 bg-yellow-200 dark:bg-yellow-800 rounded-full opacity-20 animate-bounce delay-1500"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start mb-4">
              <div className="flex items-center space-x-1 bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full">
                <FiStar className="text-orange-500 dark:text-orange-400" size={16} />
                <span className="text-sm font-medium text-orange-700 dark:text-orange-300">#1 Food Delivery App</span>
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Craving Something
              <span className="text-gradient bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent block">
                Delicious?
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-lg mx-auto lg:mx-0">
              Get your favorite food delivered hot and fresh to your doorstep. 
              From local favorites to gourmet cuisine - we've got it all!
            </p>

            {/* Rotating Features */}
            <div className="flex items-center justify-center lg:justify-start mb-8">
              <div className="flex items-center space-x-3 bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow-sm dark:shadow-gray-900/20">
                {React.createElement(features[currentFeature].icon, {
                  className: `${features[currentFeature].color}`,
                  size: 20
                })}
                <span className="font-medium text-gray-700 dark:text-gray-300">{features[currentFeature].text}</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/products"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                Order Now
                <FiPlay className="ml-2" size={16} />
              </Link>
              
              <button className="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-400 hover:shadow-lg transition-all duration-300">
                Watch Demo
                <FiPlay className="ml-2" size={16} />
              </button>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center lg:justify-start space-x-8 mt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">10k+</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">500+</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Restaurants</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">30 min</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Avg. Delivery</div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image/Animation */}
          <div className="relative">
            <div className="relative z-10">
              {/* Main Food Image Placeholder */}
              <div className="w-full max-w-lg mx-auto">
                <div className="relative">
                  {/* Main Circle */}
                  <div className="w-80 h-80 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-2xl mx-auto animate-float">
                    <div className="text-8xl">🍕</div>
                  </div>
                  
                  {/* Floating Food Items */}
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-white dark:bg-gray-700 rounded-full shadow-lg dark:shadow-gray-900/30 flex items-center justify-center animate-bounce delay-300">
                    <span className="text-2xl">🍔</span>
                  </div>
                  
                  <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white dark:bg-gray-700 rounded-full shadow-lg dark:shadow-gray-900/30 flex items-center justify-center animate-bounce delay-700">
                    <span className="text-2xl">🥤</span>
                  </div>
                  
                  <div className="absolute top-1/2 -left-8 w-14 h-14 bg-white dark:bg-gray-700 rounded-full shadow-lg dark:shadow-gray-900/30 flex items-center justify-center animate-bounce delay-1000">
                    <span className="text-xl">🍣</span>
                  </div>
                  
                  <div className="absolute top-1/4 -right-8 w-14 h-14 bg-white dark:bg-gray-700 rounded-full shadow-lg dark:shadow-gray-900/30 flex items-center justify-center animate-bounce delay-500">
                    <span className="text-xl">�</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Background Decoration */}
            <div className="absolute inset-0 -z-10">
              <div className="w-full h-full bg-gradient-to-r from-orange-100 to-red-100 rounded-3xl transform rotate-6"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-16" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,60 C150,100 350,0 600,60 C850,120 1050,20 1200,60 L1200,120 L0,120 Z" 
                fill="white" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
