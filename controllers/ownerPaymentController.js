const Payment = require("../models/Payment");

exports.getOwnerPayments = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const payments = await Payment.find({ receiverId: ownerId })
      .populate({
        path: "bookingId",
        populate: { path: "propertyId", select: "title" }
      })
      .populate("payerId", "fullName email")
      .sort({ paymentDate: -1 });

    const revenue = payments
      .filter(p => p.status === "success")
      .reduce((sum, p) => sum + p.amount, 0);

    res.json({
      success: true,
      revenue,
      payments
    });
  } catch (err) {
    console.error("Owner payments error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
