// backend/controllers/userController.js

const User = require("../models/User");

// ✅ Get logged-in user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // remove password from response
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile", details: err.message });
  }
};

// Update user profile (supports multiple addresses)
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, email, phone, addresses } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    if (addresses) user.addresses = addresses;
    await user.save();
    res.status(200).json({ message: "Profile updated", user });
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile", details: err.message });
  }
};
// Get user's order history
exports.getOrderHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('orderHistory');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(user.orderHistory);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order history', details: err.message });
  }
};

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('cart');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(user.cart);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cart', details: err.message });
  }
};

// Get user's help desk requests
exports.getHelpDeskRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('helpDeskRequests');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(user.helpDeskRequests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch help desk requests', details: err.message });
  }
};

// ✅ Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users", details: err.message });
  }
};

// ✅ Delete user (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user", details: err.message });
  }
};
