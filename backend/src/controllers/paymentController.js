// backend/controllers/paymentController.js

const crypto = require("crypto");
const Razorpay = require("razorpay");
const Order = require("../models/Order");
const razorpayConfig = require("../config/razorpayConfig");

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: razorpayConfig.key_id,
  key_secret: razorpayConfig.key_secret,
});

// ✅ Create Razorpay Order
exports.createPaymentOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;

    const options = {
      amount: amount * 100, // Convert to paise
      currency: currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    
    res.status(200).json({
      success: true,
      order,
      key_id: razorpayConfig.key_id
    });
  } catch (error) {
    console.error('Payment order creation failed:', error);
    res.status(500).json({ 
      success: false,
      error: "Failed to create payment order",
      details: error.message 
    });
  }
};

// ✅ Process Payment (Create order and return payment details)
exports.processPayment = async (req, res) => {
  try {
    const { amount, items, address, total } = req.body;

    // Create Razorpay order
    const options = {
      amount: (total || amount) * 100, // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);
    
    res.status(200).json({
      success: true,
      razorpayOrder,
      key_id: razorpayConfig.key_id,
      amount: total || amount,
      currency: 'INR'
    });
  } catch (error) {
    console.error('Payment processing failed:', error);
    res.status(500).json({ 
      success: false,
      error: "Payment processing failed",
      details: error.message 
    });
  }
};

// ✅ Verify Razorpay payment
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    // Generate expected signature using secret
    const generatedSignature = crypto
      .createHmac("sha256", razorpayConfig.key_secret)
      .update(razorpayOrderId + "|" + razorpayPaymentId)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ error: "Payment verification failed" });
    }

    // Find order by razorpayOrderId (which should have been set during order creation)
    const order = await Order.findOne({ razorpayOrderId });
    if (!order) {
      return res.status(404).json({ error: "Order not found for this payment" });
    }

    // Update order as "paid" and "confirmed"
    order.paymentStatus = "completed";
    order.paymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    order.status = "confirmed";
    await order.save();

    res.status(200).json({
      message: "Payment verified successfully",
      order,
    });
  } catch (err) {
    res.status(500).json({ error: "Payment verification failed", details: err.message });
  }
};

// ✅ Handle Payment Failure
exports.paymentFailed = async (req, res) => {
  try {
    const { razorpayOrderId } = req.body;

    const order = await Order.findOne({ razorpayOrderId });
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.paymentStatus = "Failed";
    order.status = "Cancelled";

    await order.save();

    res.status(200).json({ message: "Payment failed, order cancelled", order });
  } catch (err) {
    res.status(500).json({ error: "Failed to handle payment failure", details: err.message });
  }
};
