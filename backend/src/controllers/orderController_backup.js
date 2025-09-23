const Order = require("../models/Order");
const Cart = require("../models/Cart");
const DeliveryPartner = require("../models/DeliveryPartner");
const User = require("../models/User");
const Razorpay = require("razorpay");
const assignPartner = require("../utils/assignPartner");

// ✅ Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_123456',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_secret_123456',
});

// ✅ Place Order (checkout)
exports.placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });

    // Calculate total amount
    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount * 100, // amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    // ✅ Assign delivery partner with 15-min gap condition
    const deliveryPartner = await assignDeliveryPartnerWithGap();

    if (!deliveryPartner) {
      return res.status(500).json({ 
        error: "No delivery partner available now. Please try again in a few minutes." 
      });
    }

    // Create order entry in DB
    const order = new Order({
      user: userId,
      items: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price
      })),
      totalAmount,
      paymentStatus: 'pending',
      razorpayOrderId: razorpayOrder.id,
      deliveryPartner: deliveryPartner._id,
      deliveryPartnerAssignedAt: new Date(),
      status: "pending",
      deliveryAddress: req.body.deliveryAddress,
      estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      trackingUpdates: [
        {
          status: 'pending',
          timestamp: new Date(),
          message: 'Order placed successfully',
          location: 'Restaurant'
        }
      ],
      createdAt: new Date(),
    });

    await order.save();
    
    // Update user's order history
    await User.findByIdAndUpdate(userId, { 
      $push: { orderHistory: order._id } 
    });
    
    // Clear cart
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    // Populate the order for response
    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email phone')
      .populate('deliveryPartner', 'name phone vehicle')
      .populate('items.product', 'name imageUrl category');

    res.status(200).json({
      message: "Order placed successfully",
      order: populatedOrder,
      razorpayOrder,
      deliveryPartner,
    });
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ error: "Failed to place order", details: err.message });
  }
};

// ✅ Enhanced Delivery Partner Assignment with 15-minute gap
const assignDeliveryPartnerWithGap = async () => {
  try {
    const partners = await DeliveryPartner.find({ 
      isAvailable: true,
      status: 'active' 
    }).sort({ lastAssignedAt: 1 });

    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

    // Find partner who hasn't been assigned in the last 15 minutes
    for (let partner of partners) {
      if (!partner.lastAssignedAt || partner.lastAssignedAt < fifteenMinutesAgo) {
        // Update partner's last assigned time
        partner.lastAssignedAt = now;
        partner.currentDeliveries = (partner.currentDeliveries || 0) + 1;
        await partner.save();
        
        return partner;
      }
    }

    // If no partner available with 15-minute gap, assign to least busy partner
    const leastBusyPartner = partners.reduce((prev, current) => {
      return (current.currentDeliveries || 0) < (prev.currentDeliveries || 0) ? current : prev;
    });

    if (leastBusyPartner) {
      leastBusyPartner.lastAssignedAt = now;
      leastBusyPartner.currentDeliveries = (leastBusyPartner.currentDeliveries || 0) + 1;
      await leastBusyPartner.save();
      return leastBusyPartner;
    }

    return null;
  } catch (error) {
    console.error('Error assigning delivery partner:', error);
    return null;
  }
};

// Get user's order history (sorted by date desc)
exports.getOrderHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ user: userId })
      .populate('deliveryPartner', 'name phone vehicle')
      .populate('items.product', 'name imageUrl category')
      .sort({ createdAt: -1 });
    
    res.status(200).json(orders);
  } catch (err) {
    console.error('Error fetching order history:', err);
    res.status(500).json({ error: 'Failed to fetch order history', details: err.message });
  }
};

// Get orders by user ID (for admin or specific user queries)
exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ user: userId })
      .populate('deliveryPartner', 'name phone vehicle')
      .populate('items.product', 'name imageUrl category')
      .sort({ createdAt: -1 });
    
    res.status(200).json(orders);
  } catch (err) {
    console.error('Error fetching user orders:', err);
    res.status(500).json({ error: 'Failed to fetch user orders', details: err.message });
  }
};

// Get single order details
exports.getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate('user', 'name email phone')
      .populate('deliveryPartner', 'name phone vehicle location')
      .populate('items.product', 'name imageUrl category description');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.status(200).json(order);
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ error: 'Failed to fetch order', details: err.message });
  }
};

// Get order tracking info with live updates
exports.getOrderTracking = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate('deliveryPartner', 'name phone vehicle location currentLocation')
      .populate('items.product', 'name imageUrl');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Add estimated delivery time if not set
    if (!order.estimatedDeliveryTime) {
      order.estimatedDeliveryTime = new Date(order.createdAt.getTime() + 30 * 60 * 1000);
      await order.save();
    }
    
    res.status(200).json({
      _id: order._id,
      status: order.status,
      trackingUpdates: order.trackingUpdates,
      estimatedDeliveryTime: order.estimatedDeliveryTime,
      deliveryPartner: order.deliveryPartner,
      items: order.items,
      totalAmount: order.totalAmount,
      deliveryAddress: order.deliveryAddress
    });
  } catch (err) {
    console.error('Error fetching order tracking:', err);
    res.status(500).json({ error: 'Failed to fetch order tracking', details: err.message });
  }
};

// Update order status with tracking updates
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, location, message } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update status
    order.status = status;
    
    // Add tracking update
    const trackingUpdate = {
      status,
      timestamp: new Date(),
      message: message || getDefaultMessage(status),
      location: location || 'Unknown'
    };
    
    order.trackingUpdates.push(trackingUpdate);

    // Update delivery partner status
    if (status === 'delivered' && order.deliveryPartner) {
      await DeliveryPartner.findByIdAndUpdate(order.deliveryPartner, {
        $inc: { currentDeliveries: -1 },
        lastDeliveryTime: new Date()
      });
    }

    await order.save();
    
    const populatedOrder = await Order.findById(orderId)
      .populate('deliveryPartner', 'name phone vehicle')
      .populate('items.product', 'name imageUrl');
    
    res.status(200).json({ 
      message: 'Order status updated', 
      order: populatedOrder 
    });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ error: 'Failed to update order status', details: err.message });
  }
};

// Helper function for default status messages
const getDefaultMessage = (status) => {
  const messages = {
    'pending': 'Order received and being processed',
    'confirmed': 'Order confirmed by restaurant',
    'preparing': 'Your order is being prepared',
    'ready': 'Order ready for pickup',
    'out_for_delivery': 'Order is out for delivery',
    'delivered': 'Order delivered successfully',
    'cancelled': 'Order cancelled'
  };
  return messages[status] || 'Order status updated';
};

// Get all orders (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find()
      .populate('user', 'name email phone')
      .populate('deliveryPartner', 'name phone vehicle')
      .populate('items.product', 'name imageUrl category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Order.countDocuments();
    
    res.status(200).json({
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasMore: skip + orders.length < total
      }
    });
  } catch (err) {
    console.error('Error fetching all orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders', details: err.message });
  }
};

// Payment confirmation
exports.confirmPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;
    
    // Verify payment signature (implement Razorpay signature verification)
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update payment status
    order.paymentStatus = 'completed';
    order.paymentId = paymentId;
    order.status = 'confirmed';
    
    // Add tracking update
    order.trackingUpdates.push({
      status: 'confirmed',
      timestamp: new Date(),
      message: 'Payment confirmed, order confirmed by restaurant',
      location: 'Restaurant'
    });

    await order.save();

    res.status(200).json({
      message: 'Payment confirmed successfully',
      order
    });
  } catch (err) {
    console.error('Error confirming payment:', err);
    res.status(500).json({ error: 'Failed to confirm payment', details: err.message });
  }
};
    }

    // create order entry in DB
    const order = new Order({
      user: userId,
      products: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount,
      paymentStatus: 'pending',
      razorpayOrderId: razorpayOrder.id,
      deliveryPartner: deliveryPartner._id,
      deliveryPartnerAssignedAt: new Date(),
      status: "pending",
      deliveryAddress: req.body.deliveryAddress,
      createdAt: new Date(),
    });

    await order.save();
    await User.findByIdAndUpdate(userId, { $push: { orderHistory: order._id } });
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    res.status(200).json({
      message: "Order placed successfully",
      order,
      razorpayOrder,
      deliveryPartner,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to place order", details: err.message });
  }
};

// ✅ Assign Delivery Partner with 20 min gap condition
const assignDeliveryPartner = async () => {
  const partners = await DeliveryPartner.find();

  for (let partner of partners) {
    if (
      !partner.lastDeliveryTime ||
      new Date() - new Date(partner.lastDeliveryTime) > 20 * 60 * 1000
    ) {
      partner.lastDeliveryTime = new Date();
      await partner.save();
      return partner;
    }
  }

  return null; // no available partner
};

// Get order history (sorted by date desc)
exports.getOrderHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order history', details: err.message });
  }
};

// Get order tracking info
exports.getOrderTracking = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate('deliveryPartner');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order tracking', details: err.message });
  }
};

// For admin: update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    res.status(200).json({ message: 'Order status updated', order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status', details: err.message });
  }
};
