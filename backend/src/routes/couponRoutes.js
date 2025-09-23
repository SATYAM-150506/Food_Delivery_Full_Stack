const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.post('/', authMiddleware, adminMiddleware, couponController.createCoupon);
router.get('/', couponController.getAllCoupons);
router.post('/apply', authMiddleware, couponController.applyCoupon);
router.put('/deactivate/:couponId', authMiddleware, adminMiddleware, couponController.deactivateCoupon);

module.exports = router;
