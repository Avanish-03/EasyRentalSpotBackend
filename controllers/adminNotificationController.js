// controllers/adminNotificationController.js
const Notification = require("../models/Notification");
const User = require("../models/User");
const { sendNotification } = require("../services/notificationService");
const mongoose = require("mongoose");

/**
 * GET /api/admin/notifications
 * query: page, limit, userId, type, isRead, search, sort
 */
exports.getAllNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, userId, type, isRead, search = "", sort = "-createdAt" } = req.query;
    const filters = {};

    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ success:false, message:"Invalid userId" });
      filters.userId = userId;
    }
    if (type) filters.type = type;
    if (typeof isRead !== "undefined") filters.isRead = isRead === "true";

    if (search) {
      // search in title or message
      filters.$or = [
        { title: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Notification.find(filters).sort(sort).skip(skip).limit(Number(limit)),
      Notification.countDocuments(filters)
    ]);

    res.json({
      success: true,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      },
      notifications: items
    });
  } catch (err) {
    console.error("Admin getAllNotifications err:", err);
    res.status(500).json({ success:false, message:"Server error" });
  }
};

/**
 * POST /api/admin/notifications/send
 * body: { userId, type, title, message, metadata }
 * Send single notification to a user
 */
exports.sendToUser = async (req, res) => {
  try {
    const { userId, type = "system", title, message, metadata = {} } = req.body;
    if (!userId || !title || !message) return res.status(400).json({ success:false, message:"userId, title & message required" });

    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ success:false, message:"Invalid userId" });

    await sendNotification(userId, type, title, message, metadata);

    res.json({ success:true, message:"Notification sent" });
  } catch (err) {
    console.error("Admin sendToUser err:", err);
    res.status(500).json({ success:false, message:"Server error" });
  }
};

/**
 * POST /api/admin/notifications/broadcast
 * body: { role, type, title, message, metadata }
 * role optional: "Owner"|"Tenant"|"Admin" or omitted => all users
 */
exports.broadcast = async (req, res) => {
  try {
    const { role, type = "system", title, message, metadata = {} } = req.body;
    if (!title || !message) return res.status(400).json({ success:false, message:"title & message required" });

    let usersQuery = {};
    if (role) {
      // support role name or ObjectId
      usersQuery = { };
      // If role looks like ObjectId, match role field; else match role.name (assumes role populated elsewhere)
      if (mongoose.Types.ObjectId.isValid(role)) usersQuery.role = role;
      else {
        // find role ids by name
        const Role = require("../models/Role");
        const roleDoc = await Role.findOne({ name: new RegExp(`^${role}$`, "i") });
        if (!roleDoc) return res.status(404).json({ success:false, message:"Role not found" });
        usersQuery.role = roleDoc._id;
      }
    }

    // fetch recipients (but keep lightweight fields)
    const recipients = await User.find(usersQuery).select("_id");
    if (!recipients.length) return res.json({ success: true, message: "No recipients found" });

    // Send in parallel but not too many at once (simple approach)
    await Promise.all(recipients.map(u => sendNotification(u._id, type, title, message, metadata)));

    res.json({ success:true, message:`Broadcast sent to ${recipients.length} users` });
  } catch (err) {
    console.error("Admin broadcast err:", err);
    res.status(500).json({ success:false, message:"Server error" });
  }
};

/**
 * PUT /api/admin/notifications/:id/mark-read
 */
exports.markRead = async (req, res) => {
  try {
    const notif = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new:true });
    if (!notif) return res.status(404).json({ success:false, message:"Notification not found" });
    res.json({ success:true, notification: notif });
  } catch (err) {
    console.error("Admin markRead err:", err);
    res.status(500).json({ success:false, message:"Server error" });
  }
};

/**
 * DELETE /api/admin/notifications/:id
 */
exports.deleteNotification = async (req, res) => {
  try {
    const deleted = await Notification.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success:false, message:"Notification not found" });
    res.json({ success:true, message:"Deleted" });
  } catch (err) {
    console.error("Admin deleteNotification err:", err);
    res.status(500).json({ success:false, message:"Server error" });
  }
};
