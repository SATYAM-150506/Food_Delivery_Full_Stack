import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../Context/CartContext';
import { AuthContext } from '../../Context/AuthContext';
import { useDarkMode } from '../../Context/DarkModeContext';
import { FiShoppingBag, FiArrowRight, FiCreditCard } from 'react-icons/fi';

const PaymentGateway = () => {
  const { cartItems } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if no user or cart items
    if (!user) {
      navigate('/login');
      return;
    }
    if (!cartItems || cartItems.length === 0) {
      navigate('/cart');
      return;
    }
  }, [user, cartItems, navigate]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              isDarkMode ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-100 text-blue-600'
            }`}>
              <FiCreditCard className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Payment Gateway</h2>
            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Complete payment integration
            </p>
          </div>

          {/* Info Card */}
          <div className={`rounded-xl shadow-lg p-8 mb-6 text-center ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
              isDarkMode ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-600'
            }`}>
              <FiShoppingBag className="w-6 h-6" />
            </div>
            
            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Payment Ready!
            </h3>
            
            <p className={`mb-6 leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Razorpay payment processing has been integrated into the checkout flow. 
              You can now accept payments via UPI, Cards, Net Banking, and Wallets.
            </p>

            <div className={`p-4 rounded-lg mb-6 ${
              isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'
            }`}>
              <div className="flex items-center justify-between text-sm">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Payment Methods:</span>
                <span className={`font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  UPI • Cards • Net Banking • Wallets • COD
                </span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className={`inline-flex items-center px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              <span>Go to Checkout</span>
              <FiArrowRight className="ml-2 w-4 h-4" />
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                🔒 Secure Payments
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                All transactions are secured with Razorpay's enterprise-grade encryption
              </p>
            </div>
            
            <div className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ⚡ Instant Processing
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Real-time payment verification and order confirmation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;
