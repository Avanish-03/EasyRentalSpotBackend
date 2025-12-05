const router = require("express").Router();
const auth = require("../middleware/authMiddleware");

const {
  getPlans,
  getMySubscription,
  purchaseSubscription,
  cancelSubscription
} = require("../controllers/tenantSubscriptionController");

// GET /api/tenant/subscriptions/plans
router.get("/subscriptions/plans", auth(["Tenant"]), getPlans);

// GET /api/tenant/subscriptions/me
router.get("/subscriptions/me", auth(["Tenant"]), getMySubscription);

// POST /api/tenant/subscriptions/purchase
router.post("/subscriptions/purchase", auth(["Tenant"]), purchaseSubscription);

// PUT /api/tenant/subscriptions/cancel
router.put("/subscriptions/cancel", auth(["Tenant"]), cancelSubscription);

module.exports = router;
