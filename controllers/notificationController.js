const Notification = require("../models/Notification");

// GET notifications for logged-in user
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 10,
      type,
      isRead,
      sort = "-createdAt"
    } = req.query;

    const filters = { userId };

    if (type) filters.type = type;
    if (isRead === "true") filters.isRead = true;
    if (isRead === "false") filters.isRead = false;

    const skip = (page - 1) * limit;

    const notifications = await Notification.find(filters)
      .sort(sort)
      .skip(Number(skip))
      .limit(Number(limit));

    const total = await Notification.countDocuments(filters);

    res.json({
      success: true,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
      notifications,
    });
  } catch (err) {
    console.log("Get notifications err:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// MARK SINGLE AS READ
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const noti = await Notification.findOne({ _id: id, userId });
    if (!noti) return res.status(404).json({ success: false, message: "Not found" });

    noti.isRead = true;
    await noti.save();

    res.json({ success: true, message: "Notification marked as read" });
  } catch (err) {
    console.log("Mark as read err:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// MARK ALL READ
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    console.log("Mark all read err:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE NOTIFICATION
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;

    const deleted = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId,
    });

    if (!deleted)
      return res.status(404).json({ success: false, message: "Not found" });

    res.json({ success: true, message: "Notification deleted" });
  } catch (err) {
    console.log("Delete err:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
