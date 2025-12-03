const Notification = require("../models/Notification");

module.exports = async function createNotification(
  userId,
  type,
  title,
  message,
  metadata = {}
) {
  try {
    return await Notification.create({
      userId,
      type,
      title,
      message,
      metadata,
      isRead: false,
    });
  } catch (err) {
    console.log("Notification error:", err);
    return null;
  }
};
