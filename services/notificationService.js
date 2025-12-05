const Notification = require("../models/Notification");

exports.sendNotification = async (userId, type, title, message, metadata = {}) => {
  try {
    await Notification.create({
      userId,
      type,
      title,
      message,
      metadata,
    });
  } catch (err) {
    console.error("Send Notification Error:", err);
  }
};
