//routes/notificationRoutes.js
const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const controller = require("../controllers/notificationController");

router.get("/", auth(), controller.getNotifications);
router.put("/:id/read", auth(), controller.markAsRead);
router.put("/read/all", auth(), controller.markAllAsRead);
router.delete("/:id", auth(), controller.deleteNotification);

module.exports = router;
