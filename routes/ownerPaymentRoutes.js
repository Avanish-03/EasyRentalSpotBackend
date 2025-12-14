const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const ownerPaymentController = require("../controllers/ownerPaymentController");

router.get("/dashboard/owner/payments", auth(["Owner"]),ownerPaymentController.getOwnerPayments);

module.exports = router;
