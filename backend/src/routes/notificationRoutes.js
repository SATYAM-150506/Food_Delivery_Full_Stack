const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/send', authMiddleware, notificationController.sendNotification);
router.get('/user', authMiddleware, notificationController.getUserNotifications);
router.put('/read/:notificationId', authMiddleware, notificationController.markAsRead);

module.exports = router;
