const Notification = require('../models/Notification');

// Create Notification
exports.createNotification = async (req, res) => {
  try {
    const { userId, message, read } = req.body;

    const notification = new Notification({
      userId,
      message,
      read: read || false
    });

    await notification.save();
    res.status(201).json({ message: "Notification created successfully", notification });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all Notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate('userId', 'fullName email');
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Notification by ID
exports.getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate('userId', 'fullName email');
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.status(200).json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Notification
exports.updateNotification = async (req, res) => {
  try {
    const updates = req.body;
    const notification = await Notification.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!notification) return res.status(404).json({ message: "Notification not found" });

    res.status(200).json({ message: "Notification updated", notification });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Notification
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) return res.status(404).json({ message: "Notification not found" });

    res.status(200).json({ message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
