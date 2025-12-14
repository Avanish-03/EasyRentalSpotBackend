// controllers/adminBookingController.js
const Booking = require("../models/Booking");
const User = require("../models/User");
const Property = require("../models/Property");
const Payment = require("../models/Payment");
const mongoose = require("mongoose");

// GET /api/admin/bookings
exports.getAllBookings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search = "",
      dateFrom,
      dateTo,
      sort = "-createdAt"
    } = req.query;

    const filters = {};

    if (status) filters.status = status;

    // Date range filter
    if (dateFrom || dateTo) {
      filters.createdAt = {};
      if (dateFrom) filters.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filters.createdAt.$lte = new Date(dateTo);
    }

    // Search (tenant name, email, property title)
    if (search) {
      const users = await User.find({
        $or: [
          { fullName: { $regex: search, $options: "i" }},
          { email: { $regex: search, $options: "i" }}
        ]
      }).select("_id");

      const properties = await Property.find({
        title: { $regex: search, $options: "i" }
      }).select("_id");

      const userIds = users.map(u => u._id);
      const propIds = properties.map(p => p._id);

      filters.$or = [
        { tenantId: { $in: userIds } },
        { propertyId: { $in: propIds } }
      ];
    }

    const skip = (page - 1) * limit;

    const bookings = await Booking.find(filters)
      .populate("tenantId", "fullName email phone")
      .populate("ownerId", "fullName email phone")
      .populate("propertyId", "title price")
      .populate("paymentId")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Booking.countDocuments(filters);

    res.json({
      success: true,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      },
      bookings
    });

  } catch (err) {
    console.error("Admin getAllBookings:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/admin/bookings/:id
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate("tenantId", "fullName email phone")
      .populate("ownerId", "fullName email phone")
      .populate("propertyId")
      .populate("paymentId");

    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    res.json({ success: true, booking });

  } catch (err) {
    console.error("Admin getBookingById:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/admin/bookings/:id/status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const allowed = ["pending", "confirmed", "cancelled", "completed"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const booking = await Booking.findById(id).populate("paymentId");

    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    booking.status = status;

    if (status === "cancelled") {
      booking.cancelReason = reason || "Cancelled by admin";
    }

    if (status === "completed") {
      booking.completedAt = new Date();
    }

    await booking.save();

    // PAYMENT FLOW
    if (status === "cancelled" && booking.paymentId?.status === "success") {
      await Payment.findByIdAndUpdate(booking.paymentId._id, { status: "refunded" });
    }

    if (status === "completed" && booking.paymentId?.status !== "success") {
      await Payment.findByIdAndUpdate(booking.paymentId._id, {
        status: "success"
      });
    }

    const updated = await Booking.findById(id)
      .populate("tenantId")
      .populate("propertyId")
      .populate("paymentId");

    res.json({ success: true, message: "Booking status updated", booking: updated });

  } catch (err) {
    console.error("Admin updateBookingStatus:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /api/admin/bookings/:id
exports.deleteBooking = async (req, res) => {
  try {
    const deleted = await Booking.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ success: false, message: "Booking not found" });

    res.json({ success: true, message: "Booking deleted" });

  } catch (err) {
    console.error("Admin deleteBooking:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
