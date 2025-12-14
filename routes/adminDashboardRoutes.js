//adminDashboardRoutes.js
const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");
const ctrl = require("../controllers/adminDashboardController");

router.get("/summary", auth(), adminOnly, ctrl.getSummary);
router.get("/bookings-trend", auth(), adminOnly, ctrl.getBookingsTrend);
router.get("/revenue-trend", auth(), adminOnly, ctrl.getRevenueTrend);
router.get("/property-status", auth(), adminOnly, ctrl.getPropertyStatusStats);
router.get("/top-owners", auth(), adminOnly, ctrl.getTopOwners);
router.get("/reports", auth(), adminOnly, ctrl.getReportStats);

module.exports = router;
