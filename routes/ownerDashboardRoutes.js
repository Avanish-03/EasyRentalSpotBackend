const express = require("express");
const router = express.Router();
const { getOwnerStats } = require("../controllers/ownerDashboardController");
const authMiddleware = require("../middleware/authMiddleware");
const { getOwnerProperties } = require("../controllers/ownerDashboardController");
const {
  getOwnerBookings,
  getOwnerBookingById,
  updateBookingStatus
} = require("../controllers/ownerDashboardController");
const { getOwnerPayments } = require("../controllers/ownerDashboardController");
const {
  getOwnerReviews,
  getOwnerReviewsSummary
} = require("../controllers/ownerDashboardController");
const { getOwnerVisits, updateVisitStatus } = require("../controllers/visitController");


router.get("/stats", authMiddleware, getOwnerStats);

router.get("/properties", authMiddleware, getOwnerProperties);

router.get("/bookings", authMiddleware, getOwnerBookings);
router.get("/bookings/:id", authMiddleware, getOwnerBookingById);
router.put("/bookings/:id/status", authMiddleware, updateBookingStatus);

router.get("/payments", authMiddleware, getOwnerPayments);

router.get("/reviews", authMiddleware, getOwnerReviews);
router.get("/reviews/summary", authMiddleware, getOwnerReviewsSummary);

router.get("/visits", authMiddleware, getOwnerVisits);
router.put("/visits/:id/status", authMiddleware, updateVisitStatus);

module.exports = router;
