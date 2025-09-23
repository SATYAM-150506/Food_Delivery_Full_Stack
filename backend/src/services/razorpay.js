const Razorpay = require('razorpay');
const { key_id, key_secret } = require('../config/razorpayConfig');

const razorpayInstance = new Razorpay({
  key_id,
  key_secret
});

exports.createOrder = async (amount, currency = 'INR', receipt = '') => {
  return razorpayInstance.orders.create({
    amount: amount * 100, // convert to paise
    currency,
    receipt,
    payment_capture: 1
  });
};

exports.verifySignature = (orderId, paymentId, signature) => {
  const crypto = require('crypto');
  const generatedSignature = crypto
    .createHmac('sha256', key_secret)
    .update(orderId + '|' + paymentId)
    .digest('hex');
  return generatedSignature === signature;
};
