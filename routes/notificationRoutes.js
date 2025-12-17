//routes/notificationRoutes.js
const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const controller = require("../controllers/notificationController");

router.get("/", auth(["Owner"]), controller.getNotifications);
router.put("/:id/read", auth(["Owner"]), controller.markAsRead);
router.put("/read/all", auth(["Owner"]), controller.markAllAsRead);
router.delete("/:id", auth(["Owner"]), controller.deleteNotification);

module.exports = router;
