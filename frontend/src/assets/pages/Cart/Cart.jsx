import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../Context/CartContext';
import { AuthContext } from '../../Context/AuthContext';
import { useToast } from '../../components/ToastContainer';
import { getFoodImageSrc, handleImageError } from '../../utils/imageUtils';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiArrowRight, FiClock, FiTruck } from 'react-icons/fi';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { showSuccess, showError } = useToast();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(49);

  const validPromoCodes = {
    'SAVE10': 10,
    'FIRST20': 20,
    'WELCOME15': 15
  };

  const handleApplyPromo = () => {
    if (validPromoCodes[promoCode]) {
      const discountPercent = validPromoCodes[promoCode];
      setDiscount((getCartTotal() * discountPercent) / 100);
      showSuccess(`Promo code applied! ${discountPercent}% discount added.`);
    } else {
      showError('Invalid promo code');
      setDiscount(0);
    }
  };

  const handleCheckout = () => {
    // Check if user is properly authenticated with both user object and _id
    if (!user || !user._id) {
      // Store the intended destination for after login - only set checkout redirect from cart
      localStorage.setItem('redirectAfterLogin', '/checkout');
      navigate('/login?redirect=checkout');
    } else {
      // User is authenticated, proceed to checkout
      navigate('/checkout');
    }
  };

  const subtotal = getCartTotal ? getCartTotal() : cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const finalTotal = subtotal - discount + (subtotal > 299 ? 0 : deliveryFee);

  if (!cart || cart.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Your Cart
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {cart.length} items • Ready to checkout
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Order Items</h2>
                <button
                  onClick={() => {
                    if (clearCart) {
                      clearCart();
                      showSuccess && showSuccess('Cart cleared');
                    }
                  }}
                  className="text-sm text-red-500 hover:text-red-600 font-medium"
                >
                  Clear Cart
                </button>
              </div>

              <div className="space-y-4">
                {cart.map((item) => (
                  <CartItem
                    key={item._id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                  />
                ))}
              </div>

              {/* Continue Shopping */}
              <div className="mt-6 pt-6 border-t">
                <button
                  onClick={() => window.location.href = '/products'}
                  className="inline-flex items-center text-orange-500 hover:text-orange-600 font-medium"
                >
                  ← Continue Shopping
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/20 p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h2>

              {/* Promo Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Promo Code
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="px-4 py-2 bg-orange-500 dark:bg-orange-600 text-white rounded-lg hover:bg-orange-600 dark:hover:bg-orange-700 transition-colors"
                  >
                    Apply
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Try: SAVE10, FIRST20, WELCOME15
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal ({cart.length} items)</span>
                  <span className="font-medium text-gray-900 dark:text-white">₹{subtotal.toFixed(2)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Delivery Fee</span>
                  {subtotal > 299 ? (
                    <span className="text-green-600 dark:text-green-400">FREE</span>
                  ) : (
                    <span className="text-gray-900 dark:text-white">₹{deliveryFee}</span>
                  )}
                </div>
                
                {subtotal <= 299 && (
                  <div className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                    Add ₹{(299 - subtotal).toFixed(2)} more for free delivery
                  </div>
                )}
                
                <div className="border-t dark:border-gray-600 pt-3 flex justify-between text-lg font-semibold">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-orange-600 dark:text-orange-400">₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-6">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                  <FiClock className="mr-2" size={16} />
                  <span>Estimated delivery: 25-35 mins</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <FiTruck className="mr-2" size={16} />
                  <span>Standard delivery</span>
                </div>
              </div>

              {/* Login Notice */}
              {!user && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Almost there!</strong> You'll need to login to complete your order.
                  </p>
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <FiShoppingBag size={18} />
                <span>{user ? 'Proceed to Checkout' : 'Login & Checkout'}</span>
                <FiArrowRight size={18} />
              </button>

              {/* Security Info */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  🔒 Secure checkout • Safe payment options
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Cart Item Component
const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove && onRemove(item._id);
    }, 300);
  };

  return (
    <div className={`flex items-center space-x-4 py-4 border-b border-gray-100 dark:border-gray-700 last:border-0 transition-all duration-300 ${isRemoving ? 'opacity-0 transform scale-95' : ''}`}>
      {/* Image */}
      <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
        <img
          src={getFoodImageSrc(item.product || item)}
          alt={item.name || item.product?.name}
          className="w-full h-full object-cover"
          onError={(e) => handleImageError(e, item.product || item)}
        />
      </div>

      {/* Item Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{item.name || item.product?.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{item.description || item.product?.description || 'Delicious food item'}</p>
        <div className="flex items-center mt-1">
          <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
            ₹{item.product?.price || item.price || 0}
          </span>
          {(item.product?.originalPrice || item.originalPrice) && (item.product?.originalPrice || item.originalPrice) > (item.product?.price || item.price || 0) && (
            <span className="ml-2 text-sm text-gray-400 dark:text-gray-500 line-through">
              ₹{item.product?.originalPrice || item.originalPrice}
            </span>
          )}
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
          <button
            onClick={() => {
              if (item.quantity <= 1) {
                // Auto-remove when quantity would go to zero
                handleRemove();
              } else {
                onUpdateQuantity && onUpdateQuantity(item._id, item.quantity - 1);
              }
            }}
            className="p-2 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300"
          >
            <FiMinus size={14} />
          </button>
          <span className="px-3 py-2 text-sm font-medium min-w-[40px] text-center text-gray-900 dark:text-white">
            {item.quantity || 1}
          </span>
          <button
            onClick={() => onUpdateQuantity && onUpdateQuantity(item._id, (item.quantity || 1) + 1)}
            className="p-2 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300"
          >
            <FiPlus size={14} />
          </button>
        </div>

        {/* Total Price for Item */}
        <div className="text-right min-w-[80px]">
          <div className="font-bold text-gray-900 dark:text-white">
            ₹{((item.product?.price || item.price || 0) * (item.quantity || 1)).toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {item.quantity || 1} × ₹{item.product?.price || item.price || 0}
          </div>
        </div>

        {/* Remove Button */}
        <button
          onClick={handleRemove}
          className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          aria-label="Remove item"
        >
          <FiTrash2 size={16} />
        </button>
      </div>
    </div>
  );
};

// Empty Cart Component
const EmptyCart = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-32 h-32 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiShoppingBag size={48} className="text-orange-500 dark:text-orange-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your cart is empty</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Looks like you haven't added any delicious items to your cart yet. 
          Let's change that!
        </p>
        <button
          onClick={() => window.location.href = '/products'}
          className="inline-flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          <span>Start Shopping</span>
          <FiArrowRight size={18} />
        </button>

        {/* Popular Categories */}
        <div className="mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Or browse our popular categories:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Pizza', 'Burger', 'Indian', 'Chinese'].map((category) => (
              <button
                key={category}
                onClick={() => window.location.href = `/products?category=${category}`}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full transition-colors"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
