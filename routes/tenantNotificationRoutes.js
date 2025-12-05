const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
  getTenantNotifications,
  markRead,
  markAllRead,
  deleteNotification,
  deleteAllNotifications,
} = require("../controllers/tenantNotificationController");

router.get("/", auth, getTenantNotifications);

router.put("/:id/read", auth, markRead);

router.put("/read-all", auth, markAllRead);

router.delete("/:id", auth, deleteNotification);

router.delete("/", auth, deleteAllNotifications);

module.exports = router;
