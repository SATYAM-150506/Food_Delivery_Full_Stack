const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// User management
router.get('/users', authMiddleware, adminMiddleware, adminController.getAllUsers);
router.put('/users/:id', authMiddleware, adminMiddleware, adminController.updateUser);
router.delete('/users/:id', authMiddleware, adminMiddleware, adminController.deleteUser);

// Product management
router.post('/products', authMiddleware, adminMiddleware, adminController.createProduct);
router.put('/products/:id', authMiddleware, adminMiddleware, adminController.updateProduct);
router.delete('/products/:id', authMiddleware, adminMiddleware, adminController.deleteProduct);
router.get('/products', authMiddleware, adminMiddleware, adminController.getAllProducts);

// Order management
router.get('/orders', authMiddleware, adminMiddleware, adminController.getAllOrders);
router.put('/orders/:id', authMiddleware, adminMiddleware, adminController.updateOrderStatus);
router.delete('/orders/:id', authMiddleware, adminMiddleware, adminController.deleteOrder);

// Delivery partner management
router.get('/delivery-partners', authMiddleware, adminMiddleware, adminController.getAllDeliveryPartners);
router.post('/delivery-partners', authMiddleware, adminMiddleware, adminController.createDeliveryPartner);
router.put('/delivery-partners/:id', authMiddleware, adminMiddleware, adminController.updateDeliveryPartner);
router.delete('/delivery-partners/:id', authMiddleware, adminMiddleware, adminController.deleteDeliveryPartner);

// Dashboard stats
router.get('/dashboard', authMiddleware, adminMiddleware, adminController.getDashboardStats);

module.exports = router;
