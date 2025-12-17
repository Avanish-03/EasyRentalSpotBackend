// controllers/tenantBookingController.js
const Booking = require("../models/Booking");
const Property = require("../models/Property");
const Payment = require("../models/Payment");
const User = require("../models/User");
const PropertyVisit = require("../models/PropertyVisit");
const createNotification = require("../utils/createNotification");
const { sendNotification } = require("../services/notificationService");
const mongoose = require("mongoose");

// Helper: check overlap between two ranges
function isOverlapping(startA, endA, startB, endB) {
  return (new Date(startA) <= new Date(endB)) && (new Date(startB) <= new Date(endA));
}

// POST /api/tenant/bookings - create booking (Tenant)
exports.createBooking = async (req, res) => {
  try {
    const tenantId = req.user.id;
    const {
      propertyId,
      bookingStartDate,
      bookingEndDate,
      totalAmount,
      bookingType = "rental", // rental or visit-based (for stay booking)
      visitId // optional when converting
    } = req.body;

    if (!propertyId || !bookingStartDate || !bookingEndDate || !totalAmount) {
      return res.status(400).json({ success: false, message: "propertyId, bookingStartDate, bookingEndDate and totalAmount required" });
    }

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ success: false, message: "Invalid propertyId" });
    }

    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ success: false, message: "Property not found" });

    // availability check: ensure no confirmed or pending booking overlaps
    const existing = await Booking.find({
      propertyId,
      status: { $in: ["pending", "confirmed"] },
      $or: [
        {
          bookingStartDate: { $lte: new Date(bookingEndDate) },
          bookingEndDate: { $gte: new Date(bookingStartDate) }
        }
      ]
    });

    if (existing.length) {
      return res.status(409).json({ success: false, message: "Property not available for selected dates" });
    }

    const booking = await Booking.create({
      propertyId,
      tenantId,
      ownerId: property.ownerId,
      bookingType,
      visitId: visitId || null,
      bookingStartDate: new Date(bookingStartDate),
      bookingEndDate: new Date(bookingEndDate),
      status: "pending",
      totalAmount,
      paymentStatus: "unpaid"
    });

    // create payment placeholder (optional)
    const payment = await Payment.create({
      bookingId: booking._id,
      payerId: tenantId,
      receiverId: property.ownerId,
      amount: totalAmount,
      currency: "INR",
      paymentMethod: "wallet", // frontend will update actual method
      status: "pending",
      paymentDate: new Date()
    });

    booking.paymentId = payment._id;
    await booking.save();

    // Notify owner
    await sendNotification(
      property.ownerId,
      "booking",
      "New Booking Request",
      `New booking request for "${property.title}" from a tenant.`,
      { bookingId: booking._id, propertyId }
    );


    // If visitId provided -> mark convertedToBooking on visit (if exists)
    if (visitId && mongoose.Types.ObjectId.isValid(visitId)) {
      await PropertyVisit.findByIdAndUpdate(visitId, { convertedToBooking: true, bookingId: booking._id });
    }

    return res.status(201).json({ success: true, message: "Booking created", booking });
  } catch (err) {
    console.error("createBooking err:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/tenant/bookings/check-availability
exports.checkAvailability = async (req, res) => {
  try {
    const { propertyId, bookingStartDate, bookingEndDate } = req.body;
    if (!propertyId || !bookingStartDate || !bookingEndDate) {
      return res.status(400).json({ success: false, message: "propertyId, bookingStartDate & bookingEndDate required" });
    }

    const conflicts = await Booking.findOne({
      propertyId,
      status: { $in: ["pending", "confirmed"] },
      bookingStartDate: { $lte: new Date(bookingEndDate) },
      bookingEndDate: { $gte: new Date(bookingStartDate) }
    });

    if (conflicts) return res.json({ success: true, available: false });
    return res.json({ success: true, available: true });
  } catch (err) {
    console.error("checkAvailability err:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/tenant/bookings - tenant booking history
exports.getMyBookings = async (req, res) => {
  try {
    const tenantId = req.user.id;
    const { page = 1, limit = 10, status, search = "", sort = "-createdAt" } = req.query;
    const filters = { tenantId };

    if (status) filters.status = status;

    // search by property title or owner name/email
    if (search) {
      const props = await Property.find({ title: { $regex: search, $options: "i" } }).select("_id");
      const propIds = props.map(p => p._id);
      const users = await User.find({
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } }
        ]
      }).select("_id");
      const userIds = users.map(u => u._id);

      filters.$or = [
        { propertyId: { $in: propIds } },
        { ownerId: { $in: userIds } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const bookings = await Booking.find(filters)
      .populate({ path: "propertyId", select: "title price locationId images" })
      .populate({ path: "ownerId", select: "fullName email phone" })
      .populate({ path: "paymentId", select: "amount status paymentMethod transactionId" })
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Booking.countDocuments(filters);

    return res.json({
      success: true,
      pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
      bookings
    });
  } catch (err) {
    console.error("getMyBookings err:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/tenant/bookings/:id - tenant booking detail
exports.getBookingById = async (req, res) => {
  try {
    const tenantId = req.user.id;
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid id" });

    const booking = await Booking.findById(id)
      .populate("propertyId")
      .populate("ownerId", "fullName email phone")
      .populate("paymentId");

    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (String(booking.tenantId) !== String(tenantId)) return res.status(403).json({ success: false, message: "Forbidden" });

    return res.json({ success: true, booking });
  } catch (err) {
    console.error("getBookingById err:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/tenant/bookings/:id/cancel - cancel booking (tenant)
exports.cancelBooking = async (req, res) => {
  try {
    const tenantId = req.user.id;
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(id).populate("paymentId");
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (String(booking.tenantId) !== String(tenantId)) return res.status(403).json({ success: false, message: "Forbidden" });

    // business rule: allow cancel if not completed (you can adapt)
    if (["completed", "cancelled"].includes(booking.status)) {
      return res.status(400).json({ success: false, message: "Cannot cancel this booking" });
    }

    booking.status = "cancelled";
    booking.cancelReason = reason || null;
    await booking.save();

    // handle payment refund placeholder
    if (booking.paymentId && booking.paymentId.status === "success") {
      await Payment.findByIdAndUpdate(booking.paymentId._id, { status: "refunded" });
    }

    // notify owner
    await createNotification(
      booking.ownerId,
      "booking",
      "Booking Cancelled",
      `Booking for property has been cancelled by tenant.`,
      { bookingId: booking._id, tenantId }
    );

    return res.json({ success: true, message: "Booking cancelled", booking });
  } catch (err) {
    console.error("cancelBooking err:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//payment Confirmation
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentId, providerTransactionId, status } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    // 1️⃣ Update payment
    payment.status = status; // success
    payment.transactionId = providerTransactionId;
    payment.paymentDate = new Date();
    await payment.save();

    // 🔥🔥 MOST IMPORTANT PART 🔥🔥
    await Booking.findByIdAndUpdate(payment.bookingId, {
      paymentStatus: "paid",
      status: "confirmed" // or "completed"
    });

    return res.json({ success: true, message: "Payment confirmed" });
  } catch (err) {
    console.error("confirmPayment err:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

