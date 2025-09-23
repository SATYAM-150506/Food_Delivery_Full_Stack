import React, { useEffect, useState } from 'react';
import { useDarkMode } from '../../Context/DarkModeContext';
import orderService from '../../services/orderService';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await orderService.getOrders();
        // Ensure data is an array
        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        setError('Failed to load orders. Please try again.');
        setOrders([]); // Ensure orders is always an array
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className={`p-6 min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Order History</h2>
      
      {loading ? (
        <div className={`text-center py-12 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm`}>
          <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading orders...</p>
        </div>
      ) : error ? (
        <div className={`text-center py-12 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm`}>
          <p className={`text-lg text-red-500 mb-2`}>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className={`text-center py-12 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm`}>
          <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No orders found.</p>
          <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            Your order history will appear here once you place an order.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className={`min-w-full rounded-lg shadow-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className={`py-3 px-4 text-left font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Order ID</th>
                <th className={`py-3 px-4 text-left font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Date</th>
                <th className={`py-3 px-4 text-left font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</th>
                <th className={`py-3 px-4 text-left font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
              {Array.isArray(orders) && orders.map(order => (
                <tr key={order._id} className={`transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}>
                  <td className={`py-3 px-4 font-mono text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    #{order._id.slice(-6)}
                  </td>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'completed' || order.status === 'confirmed'
                        ? isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'
                        : order.status === 'pending' 
                        ? isDarkMode ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-800'
                        : isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className={`py-3 px-4 font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    ₹{order.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
