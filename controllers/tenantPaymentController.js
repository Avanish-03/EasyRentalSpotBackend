// controllers/tenantPaymentController.js
const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const Property = require("../models/Property");
const createNotification = require("../utils/createNotification");
const mongoose = require("mongoose");

/*
  FLOW:
  - Tenant requests payment -> /initiate (creates Payment record with status 'pending')
  - Client integrates with payment provider using payment id / details
  - Provider calls webhook -> /webhook to confirm success/failed
  - On success: Payment.status='success', Booking.paymentStatus='paid', Booking.status maybe 'confirmed' (business rule)
  - Refunds handled by admin/owner or webhook -> /refund
*/

// POST /api/tenant/payments/initiate
// body: { bookingId, paymentMethod, amount, metadata }
exports.initiatePayment = async (req, res) => {
  try {
    const tenantId = req.user.id;
    const { bookingId, paymentMethod = "UPI", amount, metadata = {} } = req.body;

    if (!bookingId || !amount) return res.status(400).json({ success:false, message:"bookingId & amount required" });
    if (!mongoose.Types.ObjectId.isValid(bookingId)) return res.status(400).json({ success:false, message:"Invalid bookingId" });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success:false, message:"Booking not found" });
    if (String(booking.tenantId) !== String(tenantId)) return res.status(403).json({ success:false, message:"Forbidden" });

    // Create a payment placeholder
    const payment = await Payment.create({
      bookingId,
      payerId: tenantId,
      receiverId: booking.ownerId,
      amount,
      currency: "INR",
      paymentMethod,
      status: "pending",
      paymentDate: new Date(),
    });

    // Optionally return payment id + provider-ready payload
    // Frontend will use this to call payment provider (Razorpay / Stripe / etc)
    res.status(201).json({
      success: true,
      message: "Payment initiated",
      payment: {
        id: payment._id,
        amount: payment.amount,
        currency: payment.currency,
      }
    });
  } catch (err) {
    console.error("initiatePayment err:", err);
    res.status(500).json({ success:false, message:"Server error" });
  }
};

// POST /api/tenant/payments/confirm
// (For synchronous flow if client posts provider response directly)
exports.confirmPaymentClient = async (req, res) => {
  try {
    const { paymentId, providerTransactionId, status = "success", metadata = {} } = req.body;
    if (!paymentId) return res.status(400).json({ success:false, message:"paymentId required" });

    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ success:false, message:"Payment not found" });

    // Update payment
    payment.transactionId = providerTransactionId || payment.transactionId;
    payment.status = status === "success" ? "success" : (status === "failed" ? "failed" : payment.status);
    payment.paymentDate = new Date();
    await payment.save();

    // Update booking if payment succeeded
    if (payment.status === "success") {
      await Booking.findByIdAndUpdate(payment.bookingId, { paymentStatus: "paid", status: "confirmed" });
      // Notify owner & tenant
      await createNotification(payment.receiverId, "payment", "Payment Received", `₹${payment.amount} received for booking.`, { paymentId: payment._id });
      await createNotification(payment.payerId, "payment", "Payment Successful", `Your payment of ₹${payment.amount} was successful.`, { paymentId: payment._id });
    }

    res.json({ success:true, payment });
  } catch (err) {
    console.error("confirmPaymentClient err:", err);
    res.status(500).json({ success:false, message:"Server error" });
  }
};

// POST /api/tenant/payments/webhook
// Provider webhook endpoint (no auth) — verify signature in production
exports.paymentWebhook = async (req, res) => {
  try {
    // IMPORTANT: verify provider signature here (omitted for brevity)
    const payload = req.body;

    // expected payload should contain our paymentId or merchant_ref to map
    // Example payload fields: { paymentId, status, transactionId, amount, metadata }
    const { paymentId, status, transactionId } = payload;

    if (!paymentId) return res.status(400).json({ success:false, message:"paymentId missing in webhook" });

    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ success:false, message:"Payment not found" });

    payment.transactionId = transactionId || payment.transactionId;
    payment.status = status === "success" ? "success" : (status === "failed" ? "failed" : payment.status);
    payment.paymentDate = new Date();
    await payment.save();

    // Update booking & notify
    if (payment.status === "success") {
      await Booking.findByIdAndUpdate(payment.bookingId, { paymentStatus: "paid", status: "confirmed" });
      await createNotification(payment.receiverId, "payment", "Payment Received", `₹${payment.amount} received.`, { paymentId: payment._id });
      await createNotification(payment.payerId, "payment", "Payment Successful", `Your payment of ₹${payment.amount} was successful.`, { paymentId: payment._id });
    } else if (payment.status === "failed") {
      await createNotification(payment.payerId, "payment", "Payment Failed", `Your payment failed. Please try again.`, { paymentId: payment._id });
    }

    // reply 200 to provider
    res.json({ success:true });
  } catch (err) {
    console.error("paymentWebhook err:", err);
    res.status(500).json({ success:false, message:"Server error" });
  }
};

// GET /api/tenant/payments (my payments)
exports.getMyPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status, dateFrom, dateTo, sort = "-paymentDate" } = req.query;

    const filters = { payerId: userId };
    if (status) filters.status = status;
    if (dateFrom || dateTo) {
      filters.paymentDate = {};
      if (dateFrom) filters.paymentDate.$gte = new Date(dateFrom);
      if (dateTo) filters.paymentDate.$lte = new Date(dateTo);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const payments = await Payment.find(filters)
      .populate({ path: "bookingId", select: "propertyId bookingStartDate bookingEndDate" })
      .populate({ path: "receiverId", select: "fullName email" })
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Payment.countDocuments(filters);

    res.json({
      success:true,
      pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total/Number(limit)) },
      payments
    });
  } catch (err) {
    console.error("getMyPayments err:", err);
    res.status(500).json({ success:false, message:"Server error" });
  }
};

// POST /api/tenant/payments/:id/refund  (tenant requests refund) - business rules apply
exports.requestRefund = async (req, res) => {
  try {
    const tenantId = req.user.id;
    const { id } = req.params; // payment id
    const { reason } = req.body;

    const payment = await Payment.findById(id);
    if (!payment) return res.status(404).json({ success:false, message:"Payment not found" });
    if (String(payment.payerId) !== String(tenantId)) return res.status(403).json({ success:false, message:"Forbidden" });

    // Only successful payments eligible for refund
    if (payment.status !== "success") {
      return res.status(400).json({ success:false, message:"Only successful payments can be refunded" });
    }

    // Mark as refund requested (admin/owner will process)
    payment.status = "pending"; // or 'refund_requested' if you add enum
    await payment.save();

    // notify admin/owner
    await createNotification(payment.receiverId, "payment", "Refund Requested", `Tenant requested refund for payment ${payment._id}`, { paymentId: payment._id, reason });

    return res.json({ success:true, message:"Refund requested" });
  } catch (err) {
    console.error("requestRefund err:", err);
    res.status(500).json({ success:false, message:"Server error" });
  }
};
