const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// User order routes
router.post('/', authMiddleware, orderController.createOrder); // Alternative route without /create
router.post('/create', authMiddleware, orderController.createOrder);
router.get('/my-orders', authMiddleware, orderController.getUserOrders);
router.get('/:orderId', authMiddleware, orderController.getOrderById);
router.put('/:orderId', authMiddleware, orderController.updateOrder);
router.get('/track/:orderId', authMiddleware, orderController.trackOrder);
router.put('/cancel/:orderId', authMiddleware, orderController.cancelOrder);
router.put('/rate/:orderId', authMiddleware, orderController.rateOrder);

// Admin/Delivery Partner routes
router.get('/admin/all', authMiddleware, adminMiddleware, orderController.getAllOrders);
router.put('/update-status/:orderId', authMiddleware, orderController.updateOrderStatus);

module.exports = router;
