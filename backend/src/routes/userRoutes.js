const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/profile', authMiddleware, userController.getUserProfile);
router.put('/profile', authMiddleware, userController.updateUserProfile);
router.get('/order-history', authMiddleware, userController.getOrderHistory);
router.get('/cart', authMiddleware, userController.getCart);
router.get('/helpdesk', authMiddleware, userController.getHelpDeskRequests);

// Admin endpoints
router.get('/all', authMiddleware, adminMiddleware, userController.getAllUsers);
router.delete('/:id', authMiddleware, adminMiddleware, userController.deleteUser);

module.exports = router;
