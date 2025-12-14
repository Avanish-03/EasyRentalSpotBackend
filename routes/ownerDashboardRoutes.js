const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  getOwnerStats,
  getOwnerProperties,
  getOwnerBookings,
  getOwnerBookingById,
  updateBookingStatus,
  getOwnerPayments,
  getOwnerReviews,
  getOwnerReviewsSummary,
} = require("../controllers/ownerDashboardController");

const {
  getOwnerVisits,
  updateVisitStatus,
} = require("../controllers/visitController");

/* ---------- DASHBOARD ---------- */
router.get("/stats", authMiddleware(["Owner"]), getOwnerStats);

/* ---------- PROPERTIES ---------- */
router.get("/properties", authMiddleware(["Owner"]), getOwnerProperties);

/* ---------- BOOKINGS ---------- */
router.get("/bookings", authMiddleware(["Owner"]), getOwnerBookings);
router.get("/bookings/:id", authMiddleware(["Owner"]), getOwnerBookingById);
router.put(
  "/bookings/:id/status",
  authMiddleware(["Owner"]),
  updateBookingStatus
);

/* ---------- PAYMENTS ---------- */
router.get("/payments", authMiddleware(["Owner"]), getOwnerPayments);

/* ---------- REVIEWS ---------- */
router.get("/reviews", authMiddleware(["Owner"]), getOwnerReviews);
router.get(
  "/reviews/summary",
  authMiddleware(["Owner"]),
  getOwnerReviewsSummary
);

/* ---------- VISITS ---------- */
router.get("/visits", authMiddleware(["Owner"]), getOwnerVisits);
router.put(
  "/visits/:id/status",
  authMiddleware(["Owner"]),
  updateVisitStatus
);

module.exports = router;
