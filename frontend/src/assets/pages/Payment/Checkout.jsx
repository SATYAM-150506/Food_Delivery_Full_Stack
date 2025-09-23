import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../Context/CartContext';
import { AuthContext } from '../../Context/AuthContext';
import { useDarkMode } from '../../Context/DarkModeContext';
import { useToast } from '../../components/ToastContainer';
import { FiArrowLeft, FiMapPin, FiCreditCard, FiCheck, FiTruck, FiShield, FiPhone, FiUser, FiEdit } from 'react-icons/fi';
import orderService from '../../services/orderService';
import paymentService from '../../services/paymentService';

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { isDarkMode } = useDarkMode();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  // State for checkout steps
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [stepLoading, setStepLoading] = useState(false);

  // Address form state
  const [deliveryAddress, setDeliveryAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [orderNotes, setOrderNotes] = useState('');

  // Pricing calculations
  const subtotal = getCartTotal ? getCartTotal() : cart.reduce((sum, item) => {
    const price = item.product?.price || item.price || 0;
    return sum + (price * (item.quantity || 1));
  }, 0);
  const deliveryFee = subtotal > 299 ? 0 : 49;
  const tax = Math.round(subtotal * 0.05); // 5% tax
  const total = subtotal + deliveryFee + tax;

  useEffect(() => {
    // Only redirect if cart is empty
    if (!cart || cart.length === 0) {
      navigate('/cart');
      return;
    }
  }, [cart, navigate]);

  const handleAddressChange = (field, value) => {
    setDeliveryAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateAddress = () => {
    const required = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode'];
    return required.every(field => deliveryAddress[field].trim() !== '');
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validatePincode = (pincode) => {
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    return pincodeRegex.test(pincode);
  };

  const handleAddressSubmit = async () => {
    if (!validateAddress()) {
      showError('Please fill all required address fields');
      return;
    }

    if (!validatePhoneNumber(deliveryAddress.phone)) {
      showError('Please enter a valid 10-digit phone number');
      return;
    }

    if (!validatePincode(deliveryAddress.pincode)) {
      showError('Please enter a valid 6-digit PIN code');
      return;
    }
    
    setStepLoading(true);
    // Simulate API call for address validation
    await new Promise(resolve => setTimeout(resolve, 1000));
    setStepLoading(false);
    
    showSuccess('Address validated successfully!');
    setCurrentStep(2);
  };

  const handlePaymentMethodSubmit = async () => {
    setStepLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setStepLoading(false);
    
    showSuccess('Payment method selected!');
    setCurrentStep(3);
  };

  const handlePlaceOrder = async () => {
    if (!validateAddress()) {
      showError('Please fill all required address fields');
      return;
    }

    setLoading(true);
    try {
      // Prepare order data
      const orderData = {
        items: cart.map(item => ({
          product: item.product?._id || item._id,
          quantity: item.quantity,
          price: item.product?.price || item.price || 0
        })),
        deliveryAddress,
        paymentMethod,
        orderNotes,
        subtotal,
        deliveryFee,
        tax,
        total,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending'
      };

      if (paymentMethod === 'cod') {
        // Cash on Delivery - Direct order placement
        const response = await orderService.createOrder(orderData);
        
        if (response && response.success !== false) {
          const createdOrder = response.order || response;
          clearCart();
          showSuccess('Order placed successfully! You can pay cash on delivery.');
          navigate('/order-confirmation', { 
            state: { 
              orderData: createdOrder,
              orderId: createdOrder._id 
            } 
          });
        } else {
          throw new Error(response?.error || 'Failed to place order');
        }
      } else {
        // Online Payment - Razorpay Integration
        // Step 1: Create order first with pending payment status
        const pendingOrderData = {
          ...orderData,
          paymentStatus: 'pending',
          status: 'pending'
        };

        const pendingOrder = await orderService.createOrder(pendingOrderData);
        
        if (!pendingOrder || pendingOrder.success === false) {
          throw new Error(pendingOrder?.error || 'Failed to create order');
        }

        const createdOrder = pendingOrder.order || pendingOrder;

        // Step 2: Create Razorpay payment order
        const paymentOrderData = {
          amount: total,
          currency: 'INR',
          items: orderData.items,
          address: deliveryAddress,
          total: total,
          orderId: createdOrder._id
        };

        const paymentResponse = await paymentService.processPayment(paymentOrderData);
        
        if (!paymentResponse.success) {
          throw new Error('Failed to create payment order');
        }

        // Step 3: Update order with Razorpay order ID immediately
        await orderService.updateOrder(createdOrder._id, {
          razorpayOrderId: paymentResponse.razorpayOrder.id
        });

        // Configure Razorpay options
        const razorpayOptions = {
          key: paymentResponse.key_id || 'rzp_test_RAi5uQX3MTrzfi',
          amount: paymentResponse.razorpayOrder.amount,
          currency: paymentResponse.currency,
          order_id: paymentResponse.razorpayOrder.id,
          name: 'Food Delivery',
          description: `Order for ${cart.length} items`,
          image: '/favicon.ico',
          prefill: {
            name: user?.name || deliveryAddress.fullName,
            email: user?.email || '',
            contact: deliveryAddress.phone
          },
          theme: {
            color: '#F97316'
          },
          handler: async function (response) {
            try {
              // Verify payment
              const verifyData = {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              };

              const verifyResponse = await paymentService.verifyPayment(verifyData);
              
              if (verifyResponse.message === 'Payment verified successfully') {
                clearCart();
                showSuccess('Payment successful! Order placed successfully.');
                navigate('/order-confirmation', { 
                  state: { 
                    orderData: { 
                      ...createdOrder, 
                      paymentStatus: 'completed',
                      status: 'confirmed',
                      paymentId: response.razorpay_payment_id 
                    },
                    orderId: createdOrder._id 
                  } 
                });
              } else {
                throw new Error('Payment verification failed');
              }
            } catch (error) {
              console.error('Payment verification error:', error);
              showError('Payment verification failed. Please contact support.');
              // Navigate to orders page so user can see their order status
              navigate('/orders');
            } finally {
              setLoading(false);
            }
          },
          modal: {
            ondismiss: function () {
              showError('Payment cancelled. Your order was not placed.');
              setLoading(false);
            }
          }
        };

        // Initialize Razorpay
        if (!window.Razorpay) {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => {
            const rzp = new window.Razorpay(razorpayOptions);
            rzp.open();
          };
          script.onerror = () => {
            showError('Failed to load payment gateway. Please try again.');
            setLoading(false);
          };
          document.body.appendChild(script);
        } else {
          const rzp = new window.Razorpay(razorpayOptions);
          rzp.open();
        }
        
        return;
      }

    } catch (error) {
      console.error('Order placement error:', error);
      if (error.response?.status === 401) {
        showError('Your session has expired. Please login again.');
        navigate('/login');
      } else {
        showError(error.response?.data?.error || error.message || 'Failed to place order');
      }
    } finally {
      if (paymentMethod === 'cod') {
        setLoading(false);
      }
    }
  };

  // If cart is empty, redirect
  if (!cart || cart.length === 0) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center max-w-md mx-auto p-8">
          <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
            <FiTruck size={32} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
          </div>
          <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Your cart is empty
          </h2>
          <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Add some items to your cart to proceed with checkout
          </p>
          <button 
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all font-semibold shadow-lg"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/cart')}
            className={`flex items-center mb-4 transition-colors ${
              isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FiArrowLeft className="mr-2" />
            Back to Cart
          </button>
          <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Secure Checkout
          </h1>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Step {currentStep} of 3 • Powered by Razorpay
          </p>
        </div>

        {/* Mobile-friendly Progress Bar */}
        <div className={`mb-8 p-4 md:p-6 rounded-xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-sm`}>
          <div className="flex items-center justify-between">
            {/* Step 1 */}
            <div className="flex items-center">
              <button
                onClick={() => currentStep > 1 && setCurrentStep(1)}
                disabled={currentStep === 1}
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-bold mr-2 md:mr-3 transition-all ${
                  currentStep >= 1 
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/25' 
                    : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
                } ${currentStep > 1 ? 'cursor-pointer hover:shadow-xl' : ''}`}
              >
                {currentStep > 1 ? <FiCheck size={14} /> : '1'}
              </button>
              <div className="hidden sm:block">
                <p className={`font-semibold text-sm md:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Address</p>
                <p className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Delivery details</p>
              </div>
            </div>

            {/* Progress Line */}
            <div className={`flex-1 mx-2 md:mx-4 h-1 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div 
                className={`h-1 rounded-full transition-all duration-500 ${
                  currentStep >= 2 ? 'bg-green-500' : 'bg-transparent'
                }`} 
                style={{ width: currentStep >= 2 ? '100%' : '0%' }}
              />
            </div>

            {/* Step 2 */}
            <div className="flex items-center">
              <button
                onClick={() => currentStep > 2 && setCurrentStep(2)}
                disabled={currentStep <= 1}
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-bold mr-2 md:mr-3 transition-all ${
                  currentStep >= 2 
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/25' 
                    : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
                } ${currentStep > 2 ? 'cursor-pointer hover:shadow-xl' : ''}`}
              >
                {currentStep > 2 ? <FiCheck size={14} /> : '2'}
              </button>
              <div className="hidden sm:block">
                <p className={`font-semibold text-sm md:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Payment</p>
                <p className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Choose method</p>
              </div>
            </div>

            {/* Progress Line */}
            <div className={`flex-1 mx-2 md:mx-4 h-1 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div 
                className={`h-1 rounded-full transition-all duration-500 ${
                  currentStep >= 3 ? 'bg-green-500' : 'bg-transparent'
                }`} 
                style={{ width: currentStep >= 3 ? '100%' : '0%' }}
              />
            </div>

            {/* Step 3 */}
            <div className="flex items-center">
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-bold mr-2 md:mr-3 transition-all ${
                currentStep >= 3 
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/25' 
                  : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </div>
              <div className="hidden sm:block">
                <p className={`font-semibold text-sm md:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Review</p>
                <p className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Place order</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Step Forms */}
          <div className="lg:col-span-2">
            
            {/* Step 1: Delivery Address */}
            {currentStep === 1 && (
              <div className={`rounded-xl shadow-lg p-4 md:p-6 border transition-all ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <div className="flex items-center mb-6">
                  <FiMapPin className="w-5 h-5 md:w-6 md:h-6 mr-3 text-orange-500" />
                  <h2 className={`text-lg md:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Delivery Address
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Full Name *
                    </label>
                    <div className="relative">
                      <FiUser className={`absolute left-3 top-3.5 w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <input
                        type="text"
                        value={deliveryAddress.fullName}
                        onChange={(e) => handleAddressChange('fullName', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Phone Number *
                    </label>
                    <div className="relative">
                      <FiPhone className={`absolute left-3 top-3.5 w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <input
                        type="tel"
                        value={deliveryAddress.phone}
                        onChange={(e) => handleAddressChange('phone', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="Enter 10-digit phone number"
                        maxLength="10"
                        required
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.addressLine1}
                      onChange={(e) => handleAddressChange('addressLine1', e.target.value)}
                      placeholder="House/Flat No., Street Name"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Address Line 2 (Optional)
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.addressLine2}
                      onChange={(e) => handleAddressChange('addressLine2', e.target.value)}
                      placeholder="Apartment, Floor, Building (Optional)"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      City *
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Enter city"
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      State *
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Enter state"
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.pincode}
                      onChange={(e) => handleAddressChange('pincode', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Enter 6-digit PIN code"
                      maxLength="6"
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.landmark}
                      onChange={(e) => handleAddressChange('landmark', e.target.value)}
                      placeholder="Near bus stop, mall, etc."
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddressSubmit}
                  disabled={!validateAddress() || stepLoading}
                  className={`w-full py-3 md:py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/25'
                      : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {stepLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Validating Address...
                    </div>
                  ) : (
                    <>
                      Continue to Payment
                      <FiArrowLeft className="ml-2 rotate-180 w-4 h-4 inline" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {currentStep === 2 && (
              <div className={`rounded-xl shadow-lg p-4 md:p-6 border transition-all ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <div className="flex items-center mb-6">
                  <FiCreditCard className="w-5 h-5 md:w-6 md:h-6 mr-3 text-green-500" />
                  <h2 className={`text-lg md:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Payment Method
                  </h2>
                </div>

                <div className="space-y-4 mb-6">
                  {/* Online Payment */}
                  <div 
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      paymentMethod === 'card' 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                        : isDarkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
                    }`} 
                    onClick={() => setPaymentMethod('card')}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="mr-3 text-green-500"
                      />
                      <div className="flex-1">
                        <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Online Payment (Recommended)
                        </h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Pay securely with UPI, Cards, Net Banking & Wallets
                        </p>
                        <div className="flex items-center mt-2 space-x-2">
                          <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded">Secure</span>
                          <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">Instant</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cash on Delivery */}
                  <div 
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      paymentMethod === 'cod' 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                        : isDarkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
                    }`} 
                    onClick={() => setPaymentMethod('cod')}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="mr-3 text-green-500"
                      />
                      <div className="flex-1">
                        <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Cash on Delivery
                        </h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Pay with cash when your order arrives
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${
                      isDarkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    ← Back to Address
                  </button>
                  <button
                    onClick={handlePaymentMethodSubmit}
                    disabled={stepLoading}
                    className={`flex-1 py-3 px-6 rounded-xl font-semibold text-white transition-all disabled:opacity-50 ${
                      isDarkMode
                        ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-lg shadow-green-500/25'
                        : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {stepLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      <>
                        Continue to Review
                        <FiArrowLeft className="ml-2 rotate-180 w-4 h-4 inline" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Order Review and Notes */}
            {currentStep === 3 && (
              <div className={`rounded-xl shadow-lg p-4 md:p-6 border transition-all ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <div className="flex items-center mb-6">
                  <FiCheck className="w-5 h-5 md:w-6 md:h-6 mr-3 text-purple-500" />
                  <h2 className={`text-lg md:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Review Your Order
                  </h2>
                </div>

                {/* Order Summary Cards */}
                <div className="space-y-4 mb-6">
                  {/* Delivery Address Card */}
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Delivery Address
                      </h3>
                      <button
                        onClick={() => setCurrentStep(1)}
                        className={`text-sm text-orange-500 hover:text-orange-600 flex items-center ${
                          isDarkMode ? 'hover:text-orange-400' : ''
                        }`}
                      >
                        <FiEdit className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <p className="font-medium">{deliveryAddress.fullName}</p>
                      <p>{deliveryAddress.phone}</p>
                      <p>{deliveryAddress.addressLine1}</p>
                      {deliveryAddress.addressLine2 && <p>{deliveryAddress.addressLine2}</p>}
                      <p>{deliveryAddress.city}, {deliveryAddress.state} - {deliveryAddress.pincode}</p>
                      {deliveryAddress.landmark && <p>Landmark: {deliveryAddress.landmark}</p>}
                    </div>
                  </div>

                  {/* Payment Method Card */}
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Payment Method
                      </h3>
                      <button
                        onClick={() => setCurrentStep(2)}
                        className={`text-sm text-orange-500 hover:text-orange-600 flex items-center ${
                          isDarkMode ? 'hover:text-orange-400' : ''
                        }`}
                      >
                        <FiEdit className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {paymentMethod === 'cod' ? '💵 Cash on Delivery' : '💳 Online Payment (Razorpay)'}
                    </p>
                  </div>
                </div>

                {/* Order Notes */}
                <div className="mb-6">
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Order Notes (Optional)
                  </label>
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Any special instructions for your order..."
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    rows="3"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${
                      isDarkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    ← Back to Payment
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className={`flex-1 py-3 md:py-4 px-6 rounded-xl font-bold text-white transition-all disabled:opacity-50 ${
                      isDarkMode
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg shadow-blue-500/25'
                        : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Placing Order...
                      </div>
                    ) : (
                      <>
                        <FiShield className="w-5 h-5 mr-2 inline" />
                        Place Order - ₹{total.toFixed(2)}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary (Sticky Sidebar) */}
          <div className="lg:col-span-1">
            <div className={`rounded-xl shadow-lg p-4 md:p-6 border sticky top-4 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
            }`}>
              <h3 className={`text-lg md:text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Order Summary
              </h3>
              
              {/* Cart Items */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item._id} className="flex justify-between items-start">
                    <div className="flex items-center flex-1 mr-3">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} mr-2 md:mr-3 overflow-hidden flex-shrink-0`}>
                        <img
                          src={item.product?.imageUrl || item.imageUrl || item.image || '/favicon.ico'}
                          alt={item.product?.name || item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/favicon.ico';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                          {item.product?.name || item.name}
                        </p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Qty: {item.quantity || 1}
                        </p>
                      </div>
                    </div>
                    <p className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'} flex-shrink-0`}>
                      ₹{((item.product?.price || item.price || 0) * (item.quantity || 1)).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className={`border-t pt-4 space-y-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Subtotal</span>
                  <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Delivery Fee</span>
                  <span className={`${deliveryFee === 0 ? 'text-green-500' : ''} ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Tax (5%)</span>
                  <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>₹{tax.toFixed(2)}</span>
                </div>
                <div className={`flex justify-between text-base md:text-lg font-bold pt-2 border-t ${
                  isDarkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'
                }`}>
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Security Badge */}
              <div className={`mt-4 p-3 rounded-lg text-center ${isDarkMode ? 'bg-green-900/20' : 'bg-green-50'}`}>
                <FiShield className="w-5 h-5 mx-auto mb-1 text-green-500" />
                <p className="text-xs text-green-600 font-medium">
                  Your payment information is encrypted and secure
                </p>
              </div>

              {/* Razorpay Branding */}
              {paymentMethod === 'card' && (
                <div className={`mt-3 p-2 rounded text-center ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                  <p className="text-xs text-blue-600 font-medium">
                    Powered by Razorpay
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
