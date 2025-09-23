const Review = require('../models/Review');
const Product = require('../models/Product');
const DeliveryPartner = require('../models/DeliveryPartner');

// Add a review for a product
exports.addProductReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user.id;
    const review = new Review({
      user: userId,
      product: productId,
      rating,
      comment
    });
    await review.save();
    // Update product rating
    const product = await Product.findById(productId);
    if (product) {
      product.rating.count += 1;
      product.rating.average = ((product.rating.average * (product.rating.count - 1)) + rating) / product.rating.count;
      await product.save();
    }
    res.status(201).json({ message: 'Review added', review });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add review', details: err.message });
  }
};

// Add a review for a delivery partner
exports.addDeliveryPartnerReview = async (req, res) => {
  try {
    const { partnerId, rating, comment } = req.body;
    const userId = req.user.id;
    const review = new Review({
      user: userId,
      deliveryPartner: partnerId,
      rating,
      comment
    });
    await review.save();
    // Update delivery partner rating
    const partner = await DeliveryPartner.findById(partnerId);
    if (partner) {
      partner.rating = ((partner.rating * partner.totalDeliveries) + rating) / (partner.totalDeliveries + 1);
      partner.totalDeliveries += 1;
      await partner.save();
    }
    res.status(201).json({ message: 'Review added', review });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add review', details: err.message });
  }
};

// Get all reviews for a product
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId }).populate('user');
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews', details: err.message });
  }
};

// Get all reviews for a delivery partner
exports.getDeliveryPartnerReviews = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const reviews = await Review.find({ deliveryPartner: partnerId }).populate('user');
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews', details: err.message });
  }
};
