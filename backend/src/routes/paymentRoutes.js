const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

// Payment routes
router.post('/create-order', authMiddleware, paymentController.createPaymentOrder);
router.post('/pay', authMiddleware, paymentController.processPayment);
router.post('/verify', authMiddleware, paymentController.verifyPayment);
router.post('/failed', authMiddleware, paymentController.paymentFailed);

module.exports = router;
