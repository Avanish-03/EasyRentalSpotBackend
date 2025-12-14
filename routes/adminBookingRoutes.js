//routes/adminBookingRoutes.js
const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");
const ctrl = require("../controllers/adminBookingController");

router.get("/", auth(), adminOnly, ctrl.getAllBookings);
router.get("/:id", auth(), adminOnly, ctrl.getBookingById);

router.put("/:id/status", auth(), adminOnly, ctrl.updateBookingStatus);

router.delete("/:id", auth(), adminOnly, ctrl.deleteBooking);

module.exports = router;
