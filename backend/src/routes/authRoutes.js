const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// User signup
router.post('/signup', authController.signup);

// User login
router.post('/login', authController.login);

// User logout
router.post('/logout', authController.logout);

// Get current user profile (protected)
router.get('/profile', authMiddleware, authController.getProfile);

// Update user profile (protected)
router.put('/profile', authMiddleware, authController.updateProfile);

module.exports = router;
