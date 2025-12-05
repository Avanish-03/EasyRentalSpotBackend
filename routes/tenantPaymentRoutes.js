// routes/tenantPaymentRoutes.js
const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const ctrl = require("../controllers/tenantPaymentController");

// initiation (tenant)
router.post("/payments/initiate", auth(["Tenant"]), ctrl.initiatePayment);

// confirm via client (optional)
router.post("/payments/confirm", auth(["Tenant"]), ctrl.confirmPaymentClient);

// webhook (provider -> call this, implement signature verification in production)
router.post("/payments/webhook", ctrl.paymentWebhook);

// get my payments
router.get("/payments", auth(["Tenant"]), ctrl.getMyPayments);

// request refund
router.post("/payments/:id/refund", auth(["Tenant"]), ctrl.requestRefund);

module.exports = router;
