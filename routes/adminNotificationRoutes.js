//routes/adminNotificationRoutes.js
const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");
const ctrl = require("../controllers/adminNotificationController");

// list & filter
router.get("/", auth(), adminOnly, ctrl.getAllNotifications);

// send to single user
router.post("/send", auth(), adminOnly, ctrl.sendToUser);

// broadcast by role or all
router.post("/broadcast", auth(), adminOnly, ctrl.broadcast);

// admin actions
router.put("/:id/mark-read", auth(), adminOnly, ctrl.markRead);
router.delete("/:id", auth(), adminOnly, ctrl.deleteNotification);

module.exports = router;
