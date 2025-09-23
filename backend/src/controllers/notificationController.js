const Notification = require('../models/Notification');
const User = require('../models/User');

// Send a notification to a user
exports.sendNotification = async (req, res) => {
  try {
    const { userId, title, message, type } = req.body;
    const notification = new Notification({
      user: userId,
      title,
      message,
      type,
      read: false
    });
    await notification.save();
    res.status(201).json({ message: 'Notification sent', notification });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send notification', details: err.message });
  }
};

// Get all notifications for a user
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications', details: err.message });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true });
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.status(200).json({ message: 'Notification marked as read', notification });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notification as read', details: err.message });
  }
};
