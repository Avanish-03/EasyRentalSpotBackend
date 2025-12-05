const Notification = require("../models/Notification");

exports.getTenantNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.find({ userId }).sort("-createdAt");

    res.json({ success: true, notifications });
  } catch (err) {
    console.error("Get Tenant Notifications Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.markRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notif = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true }
    );

    if (!notif)
      return res.status(404).json({ success: false, message: "Notification not found" });

    res.json({ success: true, notification: notif });
  } catch (err) {
    console.error("Mark Read Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany({ userId }, { isRead: true });

    res.json({ success: true, message: "All marked read" });
  } catch (err) {
    console.error("Mark All Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deleted = await Notification.findOneAndDelete({ _id: id, userId });

    if (!deleted)
      return res.status(404).json({ success: false, message: "Notification not found" });

    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    console.error("Delete Single Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.deleteMany({ userId });

    res.json({ success: true, message: "All deleted" });
  } catch (err) {
    console.error("Delete All Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
