// backend/controllers/adminController.js

const User = require("../models/User");
const Order = require("../models/Order");
const DeliveryPartner = require("../models/DeliveryPartner");
const Product = require("../models/Product");

// Product Management
exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ message: "Product created", product });
  } catch (err) {
    res.status(500).json({ error: "Failed to create product", details: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Product updated", product });
  } catch (err) {
    res.status(500).json({ error: "Failed to update product", details: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product", details: err.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products", details: err.message });
  }
};

// Order Management
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user").populate("deliveryPartner");
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders", details: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ error: "Failed to update order", details: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete order", details: err.message });
  }
};

// Assign Delivery Partner (20 min gap logic)
exports.assignDeliveryPartner = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const partners = await DeliveryPartner.find();
    let assignedPartner = null;

    for (let partner of partners) {
      // Find last delivered order for this partner
      const lastDeliveredOrder = await Order.findOne({
        deliveryPartner: partner._id,
        status: "delivered",
      }).sort({ deliveredAt: -1 });

      if (!lastDeliveredOrder || !lastDeliveredOrder.deliveredAt) {
        assignedPartner = partner;
        break;
      }

      const diffMinutes = (new Date() - new Date(lastDeliveredOrder.deliveredAt)) / (1000 * 60);
      if (diffMinutes >= 20) {
        assignedPartner = partner;
        break;
      }
    }

    if (!assignedPartner) {
      return res.status(400).json({ error: "No delivery partner available right now. Please try later." });
    }

    order.deliveryPartner = assignedPartner._id;
    order.deliveryPartnerAssignedAt = new Date();
    order.status = "out_for_delivery";
    await order.save();

    assignedPartner.assignedOrders.push(order._id);
    assignedPartner.isAvailable = false;
    await assignedPartner.save();

    res.status(200).json({ message: "Delivery partner assigned", order });
  } catch (err) {
    res.status(500).json({ error: "Failed to assign delivery partner", details: err.message });
  }
};

// User Management
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users", details: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "User updated", user });
  } catch (err) {
    res.status(500).json({ error: "Failed to update user", details: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user", details: err.message });
  }
};
// Delivery Partner Management
exports.getAllDeliveryPartners = async (req, res) => {
  try {
    const partners = await DeliveryPartner.find();
    res.status(200).json(partners);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch delivery partners", details: err.message });
  }
};

exports.createDeliveryPartner = async (req, res) => {
  try {
    const partner = new DeliveryPartner(req.body);
    await partner.save();
    res.status(201).json({ message: "Delivery partner created", partner });
  } catch (err) {
    res.status(500).json({ error: "Failed to create delivery partner", details: err.message });
  }
};

exports.updateDeliveryPartner = async (req, res) => {
  try {
    const partner = await DeliveryPartner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Delivery partner updated", partner });
  } catch (err) {
    res.status(500).json({ error: "Failed to update delivery partner", details: err.message });
  }
};

exports.deleteDeliveryPartner = async (req, res) => {
  try {
    await DeliveryPartner.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Delivery partner deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete delivery partner", details: err.message });
  }
};
// Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalPartners = await DeliveryPartner.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    res.status(200).json({
      totalUsers,
      totalOrders,
      totalProducts,
      totalPartners,
      pendingOrders,
      deliveredOrders
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch dashboard stats", details: err.message });
  }
};
