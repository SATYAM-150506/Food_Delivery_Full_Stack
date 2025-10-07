import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../assets/Context/AuthContext';
import { getFoodImageSrc, handleImageError } from '../assets/utils/imageUtils';
import { 
  FiPackage, 
  FiClock, 
  FiMapPin, 
  FiPhone,
  FiStar,
  FiTruck,
  FiCheck,
  FiX,
  FiEye,
  FiRefreshCw,
  FiAlertCircle,
  FiFilter
} from 'react-icons/fi';

const Orders = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const statusOptions = [
    { value: 'all', label: 'All Orders', color: 'gray' },
    { value: 'placed', label: 'Placed', color: 'blue' },
    { value: 'confirmed', label: 'Confirmed', color: 'yellow' },
    { value: 'preparing', label: 'Preparing', color: 'orange' },
    { value: 'out_for_delivery', label: 'Out for Delivery', color: 'purple' },
    { value: 'delivered', label: 'Delivered', color: 'green' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' }
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, selectedStatus, currentPage]);

  useEffect(() => {
    // Check for success message from checkout
    if (location.state?.message) {
      // Show success toast or notification
      console.log(location.state.message);
    }
  }, [location]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const params = new URLSearchParams({
        page: currentPage,
        limit: 10
      });
      
      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }

      const response = await fetch(`/api/orders/my-orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        setTotalPages(data.totalPages || 1);
      } else if (response.status === 401) {
        localStorage.removeItem('authToken');
        navigate('/login');
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusConfig = statusOptions.find(option => option.value === status);
    return statusConfig ? statusConfig.color : 'gray';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'placed': return <FiPackage className="w-4 h-4" />;
      case 'confirmed': return <FiCheck className="w-4 h-4" />;
      case 'preparing': return <FiClock className="w-4 h-4" />;
      case 'out_for_delivery': return <FiTruck className="w-4 h-4" />;
      case 'delivered': return <FiCheck className="w-4 h-4" />;
      case 'cancelled': return <FiX className="w-4 h-4" />;
      default: return <FiPackage className="w-4 h-4" />;
    }
  };

  const handleTrackOrder = (orderId) => {
    navigate(`/orders/track/${orderId}`);
  };

  const handleViewOrder = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Orders</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => fetchOrders()}
              className="inline-flex items-center px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
            >
              <FiRefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your food orders</p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-2">
            <FiFilter className="w-5 h-5 text-gray-400 flex-shrink-0" />
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setSelectedStatus(option.value);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedStatus === option.value
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiPackage className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Orders Found</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {selectedStatus === 'all' 
                ? "You haven't placed any orders yet. Start ordering to see your order history!"
                : `No orders found with status: ${selectedStatus}`
              }
            </p>
            <button
              onClick={() => navigate('/products')}
              className="inline-flex items-center px-8 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 sm:p-6">
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div className="mb-2 sm:mb-0">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.orderId}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Placed on {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-${getStatusColor(order.status)}-100 text-${getStatusColor(order.status)}-800`}
                      >
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <img
                            src={getFoodImageSrc(item.product)}
                            alt={item.product?.name}
                            className="w-8 h-8 rounded object-cover"
                            onError={(e) => handleImageError(e, item.product)}
                          />
                          <span>{item.product?.name} × {item.quantity}</span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <span className="text-sm text-gray-500">
                          +{order.items.length - 3} more items
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <FiMapPin className="w-4 h-4 mr-1" />
                      <span>{order.deliveryAddress.city}, {order.deliveryAddress.state}</span>
                    </div>
                    {order.deliveryPartner && (
                      <div className="flex items-center">
                        <FiTruck className="w-4 h-4 mr-1" />
                        <span>Delivery Partner: {order.deliveryPartner.name}</span>
                      </div>
                    )}
                    {order.estimatedDeliveryTime && order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <div className="flex items-center">
                        <FiClock className="w-4 h-4 mr-1" />
                        <span>ETA: {formatDate(order.estimatedDeliveryTime)}</span>
                      </div>
                    )}
                  </div>

                  {/* Order Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-200">
                    <div className="mb-3 sm:mb-0">
                      <span className="text-lg font-semibold text-gray-900">
                        Total: {formatCurrency(order.pricing?.total || order.totalAmount)}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({order.items.length} {order.items.length === 1 ? 'item' : 'items'})
                      </span>
                    </div>

                    <div className="flex gap-2 sm:gap-3">
                      <button
                        onClick={() => handleViewOrder(order._id)}
                        className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                      >
                        <FiEye className="w-4 h-4 mr-2" />
                        View Details
                      </button>
                      
                      {['placed', 'confirmed', 'preparing', 'out_for_delivery'].includes(order.status) && (
                        <button
                          onClick={() => handleTrackOrder(order._id)}
                          className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                        >
                          <FiTruck className="w-4 h-4 mr-2" />
                          Track Order
                        </button>
                      )}

                      {order.status === 'delivered' && !order.rating && (
                        <button
                          onClick={() => navigate(`/orders/rate/${order._id}`)}
                          className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
                        >
                          <FiStar className="w-4 h-4 mr-2" />
                          Rate Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === index + 1
                          ? 'bg-orange-500 text-white'
                          : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
