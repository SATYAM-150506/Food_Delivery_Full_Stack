const Notification = require('../models/Notification');

exports.sendNotification = async (userId, title, message, type = 'info') => {
  const notification = new Notification({
    user: userId,
    title,
    message,
    type,
    read: false
  });
  await notification.save();
  return notification;
};

exports.getUserNotifications = async (userId) => {
  return Notification.find({ user: userId }).sort({ createdAt: -1 });
};
