const DeliveryPartner = require('../models/DeliveryPartner');
const Order = require('../models/Order');

/**
 * Assigns an available delivery partner with at least 15 minutes gap since last assignment
 * @param {string} orderId - The order ID to assign partner to
 * @returns {Promise<DeliveryPartner|null>}
 */
exports.assignDeliveryPartner = async (orderId) => {
  try {
    console.log(`Attempting to assign delivery partner for order: ${orderId}`);
    
    // Find all available delivery partners
    const partners = await DeliveryPartner.find({ isAvailable: true });
    
    if (partners.length === 0) {
      console.log('No available delivery partners found');
      return null;
    }

    // Find a partner with at least 15 minutes gap since last assignment
    for (let partner of partners) {
      const lastAssignedOrder = await Order.findOne({
        deliveryPartner: partner._id,
        deliveryPartnerAssignedAt: { $exists: true }
      }).sort({ deliveryPartnerAssignedAt: -1 });

      // If partner has no previous assignments or sufficient time gap
      if (!lastAssignedOrder || !lastAssignedOrder.deliveryPartnerAssignedAt) {
        return await assignPartnerToOrder(orderId, partner);
      }

      const timeDiff = (Date.now() - new Date(lastAssignedOrder.deliveryPartnerAssignedAt)) / (1000 * 60);
      if (timeDiff >= 15) { // 15 minutes gap
        return await assignPartnerToOrder(orderId, partner);
      }
    }

    console.log('All delivery partners are busy, will retry later');
    
    // Schedule retry after 5 minutes if no partner available
    setTimeout(() => {
      exports.assignDeliveryPartner(orderId);
    }, 5 * 60 * 1000);
    
    return null;
    
  } catch (error) {
    console.error('Error in assignDeliveryPartner:', error);
    return null;
  }
};

/**
 * Assigns a specific partner to an order
 * @param {string} orderId - Order ID
 * @param {Object} partner - Delivery Partner object
 * @returns {Promise<DeliveryPartner>}
 */
const assignPartnerToOrder = async (orderId, partner) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      console.log(`Order ${orderId} not found`);
      return null;
    }

    // Update order with delivery partner
    order.deliveryPartner = partner._id;
    order.deliveryPartnerAssignedAt = new Date();
    order.status = 'confirmed';
    order.statusHistory.push({
      status: 'confirmed',
      timestamp: new Date(),
      note: `Order confirmed and assigned to delivery partner: ${partner.name}`
    });

    await order.save();

    console.log(`Delivery partner ${partner.name} assigned to order ${order.orderId}`);
    return partner;
    
  } catch (error) {
    console.error('Error assigning partner to order:', error);
    return null;
  }
};

/**
 * Find optimal delivery partner based on location and availability
 * @param {Object} deliveryAddress - Delivery address with lat/lng
 * @returns {Promise<DeliveryPartner|null>}
 */
exports.findOptimalPartner = async (deliveryAddress) => {
  try {
    // This is a simplified version - in production you'd use geolocation
    const availablePartners = await DeliveryPartner.find({ 
      isAvailable: true 
    });

    if (availablePartners.length === 0) {
      return null;
    }

    // For now, return the first available partner
    // In production, you'd calculate distance and choose closest
    return availablePartners[0];
    
  } catch (error) {
    console.error('Error finding optimal partner:', error);
    return null;
  }
};

/**
 * Legacy function for backward compatibility
 */
exports.assignPartner = exports.assignDeliveryPartner;
