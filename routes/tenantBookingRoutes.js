// routes/tenantBookingRoutes.js
const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const ctrl = require("../controllers/tenantBookingController");

// Tenant booking operations (auth required)
router.post("/bookings", auth(["Tenant"]), ctrl.createBooking);
router.post("/bookings/check-availability", auth(["Tenant"]), ctrl.checkAvailability);
router.get("/bookings", auth(["Tenant"]), ctrl.getMyBookings);
router.get("/bookings/:id", auth(["Tenant"]), ctrl.getBookingById);
router.put("/bookings/:id/cancel", auth(["Tenant"]), ctrl.cancelBooking);

module.exports = router;
