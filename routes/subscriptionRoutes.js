const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const {
  createSubscription,
  getActiveSubscription,
  getSubscriptionHistory,
  getAllSubscriptions
} = require("../controllers/subscriptionController");

// OWNER
router.post("/", auth(["Owner"]), createSubscription);
router.get("/active", auth(["Owner"]), getActiveSubscription);
router.get("/history", auth(["Owner"]), getSubscriptionHistory);

// ADMIN
router.get("/admin/all", auth(["Admin"]), getAllSubscriptions);

module.exports = router;
