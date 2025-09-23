import React, { useEffect, useState } from 'react';
import { useDarkMode } from '../../Context/DarkModeContext';
import { FiTruck, FiClock, FiCheckCircle, FiPackage } from 'react-icons/fi';
import orderService from '../../services/orderService';

const OrderTracking = () => {
  const [orders, setOrders] = useState([]);
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getOrders();
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      }
    };
    fetchOrders();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      case 'preparing': return <FiPackage className="w-5 h-5 text-blue-500" />;
      case 'shipped': return <FiTruck className="w-5 h-5 text-orange-500" />;
      case 'delivered': return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      default: return <FiClock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800';
      case 'preparing': return isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800';
      case 'shipped': return isDarkMode ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-100 text-orange-800';
      case 'delivered': return isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800';
      default: return isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`p-6 min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-6">
          <FiTruck className={`w-8 h-8 mr-3 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
          <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Order Tracking</h2>
        </div>

        {orders.length === 0 ? (
          <div className={`text-center py-16 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <FiPackage className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              No Orders to Track
            </h3>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Your active orders will appear here for tracking
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order._id} className={`rounded-xl p-6 shadow-sm border ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                    {getStatusIcon(order.status)}
                    <div>
                      <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Order #{order._id.slice(-8)}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    
                    {order.expectedDelivery && (
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <FiClock className="inline w-4 h-4 mr-1" />
                        Expected: {new Date(order.expectedDelivery).toLocaleDateString()}
                      </div>
                    )}

                    <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      ₹{order.total}
                    </div>
                  </div>
                </div>

                {/* Order Progress Bar */}
                <div className="mt-6">
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>Order Confirmed</span>
                    <span>Preparing</span>
                    <span>Shipped</span>
                    <span>Delivered</span>
                  </div>
                  <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        order.status === 'confirmed' ? 'w-1/4 bg-green-500' :
                        order.status === 'preparing' ? 'w-2/4 bg-blue-500' :
                        order.status === 'shipped' ? 'w-3/4 bg-orange-500' :
                        order.status === 'delivered' ? 'w-full bg-green-500' :
                        'w-1/4 bg-gray-400'
                      }`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
