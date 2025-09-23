const Coupon = require('../models/Coupon');
const Order = require('../models/Order');

// Create a new coupon (admin only)
exports.createCoupon = async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json({ message: 'Coupon created', coupon });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create coupon', details: err.message });
  }
};

// Get all coupons
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.status(200).json(coupons);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch coupons', details: err.message });
  }
};

// Apply coupon to an order
exports.applyCoupon = async (req, res) => {
  try {
    const { orderId, code } = req.body;
    const coupon = await Coupon.findOne({ code, isActive: true });
    if (!coupon) return res.status(404).json({ error: 'Coupon not found or inactive' });
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    // Check expiry
    if (coupon.expiryDate && coupon.expiryDate < Date.now()) {
      return res.status(400).json({ error: 'Coupon expired' });
    }
    // Apply discount
    order.totalAmount = Math.max(0, order.totalAmount - coupon.discountAmount);
    order.coupon = coupon._id;
    await order.save();
    res.status(200).json({ message: 'Coupon applied', order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to apply coupon', details: err.message });
  }
};

// Deactivate coupon (admin only)
exports.deactivateCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    const coupon = await Coupon.findByIdAndUpdate(couponId, { isActive: false }, { new: true });
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    res.status(200).json({ message: 'Coupon deactivated', coupon });
  } catch (err) {
    res.status(500).json({ error: 'Failed to deactivate coupon', details: err.message });
  }
};
