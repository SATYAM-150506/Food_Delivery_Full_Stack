import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../Context/DarkModeContext';
import { FiCheck, FiPackage, FiTruck, FiHome, FiClock, FiCreditCard } from 'react-icons/fi';
import orderService from '../../services/orderService';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get order data from navigation state or URL params
  const orderData = location.state?.orderData;
  const orderId = location.state?.orderId || new URLSearchParams(location.search).get('orderId');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        if (orderData) {
          setOrder(orderData);
          setLoading(false);
        } else if (orderId) {
          const fetchedOrder = await orderService.getOrderById(orderId);
          setOrder(fetchedOrder);
          setLoading(false);
        } else {
          // No order data, redirect to orders
          navigate('/orders');
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
        setLoading(false);
        // If error, redirect to orders page
        setTimeout(() => navigate('/orders'), 3000);
      }
    };

    fetchOrderDetails();
  }, [orderData, orderId, navigate]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'completed':
        return isDarkMode ? 'text-green-300' : 'text-green-600';
      case 'pending':
        return isDarkMode ? 'text-yellow-300' : 'text-yellow-600';
      case 'processing':
        return isDarkMode ? 'text-blue-300' : 'text-blue-600';
      default:
        return isDarkMode ? 'text-gray-300' : 'text-gray-600';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'paid':
        return isDarkMode ? 'text-green-300' : 'text-green-600';
      case 'pending':
        return isDarkMode ? 'text-yellow-300' : 'text-yellow-600';
      case 'failed':
        return isDarkMode ? 'text-red-300' : 'text-red-600';
      default:
        return isDarkMode ? 'text-gray-300' : 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className={`${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <FiPackage className="mx-auto mb-4 text-6xl text-gray-400" />
          <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Order Not Found
          </h2>
          <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            We couldn't find your order details. Redirecting to orders page...
          </p>
          <button 
            onClick={() => navigate('/orders')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg"
          >
            View All Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
            <FiCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Order Confirmed!
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Thank you for your order. We'll get started on it right away.
          </p>
        </div>

        {/* Order Details Card */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Order Details
              </h2>
              <div className="space-y-1">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Order ID: <span className="font-mono">{order._id ? `#${order._id.slice(-8)}` : 'N/A'}</span>
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Order Date: {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Order Status</p>
              <p className={`font-semibold ${getStatusColor(order.status)}`}>
                {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Items Ordered ({order.items?.length || 0})
            </h3>
            <div className="space-y-3">
              {(order.items || []).map((item, index) => (
                <div key={index} className={`flex justify-between items-center py-3 px-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex-1">
                    <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {item.product?.name || item.name || 'Unknown Item'}
                    </h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Quantity: {item.quantity} × ₹{item.price}
                    </p>
                  </div>
                  <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    ₹{(item.quantity * item.price).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="mb-6">
            <h3 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              <FiHome className="inline mr-2" />
              Delivery Address
            </h3>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              {order.deliveryAddress ? (
                <div>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {order.deliveryAddress.fullName}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {order.deliveryAddress.addressLine1}
                  </p>
                  {order.deliveryAddress.addressLine2 && (
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {order.deliveryAddress.addressLine2}
                    </p>
                  )}
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Phone: {order.deliveryAddress.phone}
                  </p>
                </div>
              ) : (
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Address information not available
                </p>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="mb-6">
            <h3 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              <FiCreditCard className="inline mr-2" />
              Payment Information
            </h3>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Payment Method:</span>
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Payment Status:</span>
                <span className={`font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                  {order.paymentStatus ? order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1) : 'Pending'}
                </span>
              </div>
              {order.paymentId && (
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Transaction ID:</span>
                  <span className={`font-mono text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {order.paymentId}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Order Total */}
          <div className={`border-t pt-4 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Subtotal:</span>
                <span className={`${isDarkMode ? 'text-white' : 'text-gray-800'}`}>₹{order.subtotal || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Delivery Fee:</span>
                <span className={`${isDarkMode ? 'text-white' : 'text-gray-800'}`}>₹{order.deliveryFee || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Tax:</span>
                <span className={`${isDarkMode ? 'text-white' : 'text-gray-800'}`}>₹{order.tax || 0}</span>
              </div>
              <div className={`flex justify-between text-lg font-bold pt-2 border-t ${isDarkMode ? 'border-gray-600 text-white' : 'border-gray-200 text-gray-800'}`}>
                <span>Total:</span>
                <span>₹{order.total || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Estimated Delivery */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <h3 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            <FiTruck className="inline mr-2" />
            Estimated Delivery
          </h3>
          <div className="flex items-center">
            <FiClock className={`mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              30-45 minutes from now
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/orders')}
            className={`px-6 py-3 rounded-lg font-medium ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} transition-colors`}
          >
            View All Orders
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
