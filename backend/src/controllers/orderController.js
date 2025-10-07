const Order = require("../models/Order");
const Cart = require("../models/Cart");
const DeliveryPartner = require("../models/DeliveryPartner");
const Product = require("../models/Product");
const { assignDeliveryPartner } = require("../utils/assignPartner");

// ✅ Create Order
exports.createOrder = async (req, res) => {
  try {
    console.log('Create order request received');
    console.log('User:', req.user);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const userId = req.user.id;
    const {
      items,
      deliveryAddress,
      paymentMethod,
      paymentId,
      orderNotes,
      subtotal,
      deliveryFee,
      tax,
      total,
      paymentStatus = 'pending'
    } = req.body;

    // Validate required fields
    if (!items || !deliveryAddress || !paymentMethod) {
      console.log('Validation failed - missing required fields');
      return res.status(400).json({ 
        error: "Missing required fields: items, deliveryAddress, paymentMethod" 
      });
    }

    console.log('Validating items...');
    // Validate items and get product details
    const validatedItems = [];
    for (const item of items) {
      console.log('Validating item:', item);
      const product = await Product.findById(item.product);
      if (!product) {
        console.log('Product not found:', item.product);
        return res.status(400).json({ 
          error: `Product not found: ${item.product}` 
        });
      }
      
      validatedItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });
    }

    console.log('Creating order with validated items:', validatedItems);
    
    // Ensure email is included in delivery address
    const fullDeliveryAddress = {
      ...deliveryAddress,
      email: deliveryAddress.email || req.user.email
    };
    
    // Map frontend payment method to backend enum values
    let mappedPaymentMethod = paymentMethod;
    if (paymentMethod === 'card' || paymentMethod === 'razorpay' || paymentMethod === 'online') {
      mappedPaymentMethod = 'razorpay';
    } else if (paymentMethod === 'cod' || paymentMethod === 'cash') {
      mappedPaymentMethod = 'cod';
    }
    
    // Create the order
    const order = new Order({
      user: userId,
      items: validatedItems,
      deliveryAddress: fullDeliveryAddress,
      pricing: {
        subtotal: subtotal || validatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        deliveryFee: deliveryFee || 40,
        tax: tax || Math.round(subtotal * 0.05),
        total: total || subtotal + deliveryFee + tax
      },
      paymentMethod: mappedPaymentMethod,
      paymentId,
      paymentStatus,
      orderNotes,
      status: 'placed',
      statusHistory: [{
        status: 'placed',
        timestamp: new Date(),
        note: 'Order placed successfully'
      }]
    });

    await order.save();
    
    // Populate order details
    await order.populate([
      { path: 'items.product' },
      { path: 'user', select: 'name email phone' }
    ]);

    // Assign delivery partner after 2-3 minutes
    setTimeout(async () => {
      try {
        const partner = await assignDeliveryPartner(order._id);
        if (partner) {
          console.log(`Delivery partner ${partner.name} assigned to order ${order.orderId}`);
        }
      } catch (error) {
        console.error('Error assigning delivery partner:', error);
      }
    }, 2 * 60 * 1000); // 2 minutes delay

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { user: userId },
      { items: [], totalAmount: 0 }
    );

    res.status(201).json({
      message: "Order placed successfully",
      order,
      orderId: order.orderId
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ 
      error: "Failed to create order", 
      details: error.message 
    });
  }
};

// ✅ Get user orders
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const query = { user: userId };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('items.product')
      .populate('deliveryPartner', 'name phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.status(200).json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ 
      error: "Failed to fetch orders", 
      details: error.message 
    });
  }
};

// ✅ Get single order details
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({
      $or: [{ _id: orderId }, { orderId: orderId }],
      user: userId
    })
      .populate('items.product')
      .populate('deliveryPartner', 'name phone location')
      .populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json({ order });

  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ 
      error: "Failed to fetch order", 
      details: error.message 
    });
  }
};

// ✅ Update order details (user can update limited fields)
exports.updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Find the order
    const order = await Order.findOne({
      $or: [{ _id: orderId }, { orderId: orderId }],
      user: userId
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Allow limited fields to be updated by user
    const allowedFields = ['razorpayOrderId', 'paymentId', 'razorpaySignature'];
    const filteredUpdate = {};
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredUpdate[field] = updateData[field];
      }
    }

    // Update the order
    const updatedOrder = await Order.findByIdAndUpdate(
      order._id,
      filteredUpdate,
      { new: true }
    ).populate('items.product').populate('user', 'name email phone');

    res.status(200).json({ 
      message: "Order updated successfully",
      order: updatedOrder 
    });

  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ 
      error: "Failed to update order", 
      details: error.message 
    });
  }
};

// ✅ Update order status (admin/delivery partner)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, note } = req.body;

    const validStatuses = [
      'placed', 'confirmed', 'preparing', 'ready_for_pickup',
      'out_for_delivery', 'delivered', 'cancelled'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: "Invalid status", 
        validStatuses 
      });
    }

    const order = await Order.findOne({
      $or: [{ _id: orderId }, { orderId: orderId }]
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Update status
    order.status = status;
    
    // Add to status history
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Order status updated to ${status}`
    });

    // Set delivered timestamp
    if (status === 'delivered') {
      order.deliveredAt = new Date();
    }

    await order.save();

    // Populate for response
    await order.populate([
      { path: 'items.product' },
      { path: 'deliveryPartner', select: 'name phone' },
      { path: 'user', select: 'name email phone' }
    ]);

    res.status(200).json({
      message: "Order status updated successfully",
      order
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ 
      error: "Failed to update order status", 
      details: error.message 
    });
  }
};

// ✅ Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    const order = await Order.findOne({
      $or: [{ _id: orderId }, { orderId: orderId }],
      user: userId
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Check if order can be cancelled
    const nonCancellableStatuses = ['out_for_delivery', 'delivered', 'cancelled'];
    if (nonCancellableStatuses.includes(order.status)) {
      return res.status(400).json({ 
        error: `Cannot cancel order with status: ${order.status}` 
      });
    }

    // Update order
    order.status = 'cancelled';
    order.cancelReason = reason || 'Cancelled by user';
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: reason || 'Order cancelled by user'
    });

    await order.save();

    res.status(200).json({
      message: "Order cancelled successfully",
      order
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ 
      error: "Failed to cancel order", 
      details: error.message 
    });
  }
};

// ✅ Track order
exports.trackOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({
      $or: [{ _id: orderId }, { orderId: orderId }],
      user: userId
    })
      .populate('deliveryPartner', 'name phone location')
      .select('orderId status statusHistory estimatedDeliveryTime deliveredAt deliveryPartner location');

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Calculate tracking information
    const trackingInfo = {
      orderId: order.orderId,
      currentStatus: order.status,
      statusHistory: order.statusHistory,
      estimatedDeliveryTime: order.estimatedDeliveryTime,
      deliveredAt: order.deliveredAt,
      deliveryPartner: order.deliveryPartner,
      location: order.location,
      isDelivered: order.status === 'delivered',
      isCancelled: order.status === 'cancelled',
      canCancel: !['out_for_delivery', 'delivered', 'cancelled'].includes(order.status)
    };

    res.status(200).json({ tracking: trackingInfo });

  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ 
      error: "Failed to track order", 
      details: error.message 
    });
  }
};

// ✅ Rate order
exports.rateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { rating, review } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        error: "Rating must be between 1 and 5" 
      });
    }

    const order = await Order.findOne({
      $or: [{ _id: orderId }, { orderId: orderId }],
      user: userId
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({ 
        error: "Can only rate delivered orders" 
      });
    }

    order.rating = rating;
    order.review = review;
    await order.save();

    res.status(200).json({
      message: "Order rated successfully",
      rating: order.rating,
      review: order.review
    });

  } catch (error) {
    console.error('Rate order error:', error);
    res.status(500).json({ 
      error: "Failed to rate order", 
      details: error.message 
    });
  }
};

// ✅ Get all orders (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;

    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { 'deliveryAddress.fullName': { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('items.product')
      .populate('deliveryPartner', 'name phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.status(200).json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ 
      error: "Failed to fetch orders", 
      details: error.message 
    });
  }
};
