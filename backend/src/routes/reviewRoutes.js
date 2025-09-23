const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/product', authMiddleware, reviewController.addProductReview);
router.post('/delivery-partner', authMiddleware, reviewController.addDeliveryPartnerReview);
router.get('/product/:productId', reviewController.getProductReviews);
router.get('/delivery-partner/:partnerId', reviewController.getDeliveryPartnerReviews);

module.exports = router;
