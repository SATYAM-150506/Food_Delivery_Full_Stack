import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiPhone, 
  FiMail, 
  FiMapPin, 
  FiFacebook, 
  FiTwitter, 
  FiInstagram,
  FiClock,
  FiTruck,
  FiShield,
  FiHeart
} from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-gray-900 dark:bg-black text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 dark:from-orange-500 dark:to-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">FD</span>
              </div>
              <span className="text-xl font-bold">FoodDelivery</span>
            </div>
            <p className="text-gray-300 dark:text-gray-400 text-sm">
              Delicious food delivered fast to your doorstep. Fresh ingredients, 
              authentic flavors, and exceptional service - that's our promise.
            </p>
            <div className="flex space-x-4">
              <button className="text-gray-400 dark:text-gray-500 hover:text-orange-500 dark:hover:text-orange-400 transition-colors" aria-label="Facebook">
                <FiFacebook size={20} />
              </button>
              <button className="text-gray-400 dark:text-gray-500 hover:text-orange-500 dark:hover:text-orange-400 transition-colors" aria-label="Twitter">
                <FiTwitter size={20} />
              </button>
              <button className="text-gray-400 hover:text-orange-500 transition-colors" aria-label="Instagram">
                <FiInstagram size={20} />
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-orange-500 transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-orange-500 transition-colors text-sm">
                  Menu
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-gray-300 hover:text-orange-500 transition-colors text-sm">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/helpdesk" className="text-gray-300 hover:text-orange-500 transition-colors text-sm">
                  Help & Support
                </Link>
              </li>
              <li>
                <button className="text-gray-300 hover:text-orange-500 transition-colors text-sm">
                  About Us
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <FiPhone className="text-orange-500" size={16} />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <FiMail className="text-orange-500" size={16} />
                <span className="text-gray-300">support@fooddelivery.com</span>
              </div>
              <div className="flex items-start space-x-3 text-sm">
                <FiMapPin className="text-orange-500 mt-0.5" size={16} />
                <span className="text-gray-300">
                  123 Food Street<br />
                  Downtown, City 12345
                </span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Why Choose Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <FiClock className="text-orange-500" size={16} />
                <span className="text-gray-300">30 min delivery</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <FiTruck className="text-orange-500" size={16} />
                <span className="text-gray-300">Free delivery over $25</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <FiShield className="text-orange-500" size={16} />
                <span className="text-gray-300">100% secure payment</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <FiHeart className="text-orange-500" size={16} />
                <span className="text-gray-300">Made with love</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} FoodDelivery. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-2 sm:mt-0">
              <button className="text-gray-400 hover:text-orange-500 text-sm transition-colors">
                Privacy Policy
              </button>
              <button className="text-gray-400 hover:text-orange-500 text-sm transition-colors">
                Terms of Service
              </button>
              <button className="text-gray-400 hover:text-orange-500 text-sm transition-colors">
                Cookie Policy
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
