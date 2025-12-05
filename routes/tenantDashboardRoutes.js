// routes/tenantDashboardRoutes.js
const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { getTenantDashboard } = require("../controllers/tenantDashboardController");

// GET /api/tenant/dashboard
router.get("/dashboard", auth(["Tenant"]), getTenantDashboard);

module.exports = router;
