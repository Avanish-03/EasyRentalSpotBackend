const Property = require("../models/Property");
const Booking = require("../models/Booking");
const User = require("../models/User");
const Payment = require("../models/Payment");
const Review = require("../models/Review");
const PropertyVisit = require("../models/PropertyVisit");
const Subscription = require("../models/Subscription");

//=============owner stats
exports.getOwnerStats = async (req, res) => {
  try {
    const ownerId = req.user.id;

    // 1. PROPERTY STATS
    const totalProperties = await Property.countDocuments({ ownerId });
    const approvedProperties = await Property.countDocuments({ ownerId, approvalStatus: "approved" });
    const pendingProperties = await Property.countDocuments({ ownerId, approvalStatus: "pending" });
    const inactiveProperties = await Property.countDocuments({ ownerId, status: "inactive" });

    // 2. BOOKINGS STATS
    const totalBookings = await Booking.countDocuments({ ownerId });
    const pendingBookings = await Booking.countDocuments({ ownerId, status: "pending" });
    const confirmedBookings = await Booking.countDocuments({ ownerId, status: "confirmed" });
    const completedBookings = await Booking.countDocuments({ ownerId, status: "completed" });

    // 3. REVENUE STATS
    const totalRevenueData = await Payment.aggregate([
      { $match: { receiverId: ownerId, status: "success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // 4) ACTIVE SUBSCRIPTION STATUS
    const activeSub = await Subscription.findOne({
      userId: ownerId,
      isActive: true,
      endDate: { $gte: new Date() }
    });

    dashboard.subscriptionStatus = activeSub ? "active" : "inactive";
    dashboard.planName = activeSub?.planName || null;
    dashboard.planEndDate = activeSub?.endDate || null;

    const totalRevenue = totalRevenueData[0]?.total || 0;

    const last7DaysRevenueData = await Payment.aggregate([
      {
        $match: {
          receiverId: ownerId,
          status: "success",
          paymentDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const last7DaysRevenue = last7DaysRevenueData[0]?.total || 0;

    // 4. PROPERTY VISITS STATS
    const totalVisits = await PropertyVisit.countDocuments({ ownerId });
    const completedVisits = await PropertyVisit.countDocuments({ ownerId, status: "completed" });

    // 5. CONVERSION RATE
    const convertedVisits = await PropertyVisit.countDocuments({
      ownerId,
      convertedToBooking: true
    });

    const conversionRate = totalVisits === 0 ? 0 : Math.round((convertedVisits / totalVisits) * 100);

    // Final Response
    res.json({
      success: true,
      stats: {
        properties: {
          total: totalProperties,
          approved: approvedProperties,
          pending: pendingProperties,
          inactive: inactiveProperties
        },
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          confirmed: confirmedBookings,
          completed: completedBookings
        },
        revenue: {
          total: totalRevenue,
          last7Days: last7DaysRevenue
        },
        visits: {
          total: totalVisits,
          completed: completedVisits,
          conversionRate
        }
      }
    });

  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//=============Properties
exports.getOwnerProperties = async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Query params
    const {
      page = 1,
      limit = 10,
      search = "",
      approvalStatus,
      status,
      sort = "-createdAt"
    } = req.query;

    const filters = { ownerId };

    // search by title
    if (search) {
      filters.title = { $regex: search, $options: "i" };
    }

    if (approvalStatus) filters.approvalStatus = approvalStatus;

    if (status) filters.status = status;

    const skip = (page - 1) * limit;

    const properties = await Property.find(filters)
      .populate("amenityIds")
      .populate("locationId")
      .populate("images")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Property.countDocuments(filters);

    res.json({
      success: true,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      },
      properties
    });

  } catch (err) {
    console.error("Owner Properties Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//=============Booking
// GET /api/dashboard/owner/bookings
exports.getOwnerBookings = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const {
      page = 1,
      limit = 10,
      status,
      search = "",
      bookingType,
      dateFrom,
      dateTo,
      sort = "-createdAt"
    } = req.query;

    const filters = { ownerId };

    if (status) filters.status = status;
    if (bookingType) filters.bookingType = bookingType;

    if (dateFrom || dateTo) {
      filters.createdAt = {};
      if (dateFrom) filters.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filters.createdAt.$lte = new Date(dateTo);
    }

    // search by property title or tenant name or tenant email
    if (search) {
      const users = await User.find({
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } }
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

    const skip = (Number(page) - 1) * Number(limit);

    const bookings = await Booking.find(filters)
      .populate({
        path: "propertyId",
        select: "title price locationId images"
      })
      .populate({
        path: "tenantId",
        select: "fullName email phone"
      })
      .populate({
        path: "paymentId",
        select: "amount status paymentDate paymentMethod transactionId"
      })
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
        totalPages: Math.ceil(total / Number(limit))
      },
      bookings
    });
  } catch (err) {
    console.error("Owner Bookings Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/dashboard/owner/bookings/:id
exports.getOwnerBookingById = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate("propertyId")
      .populate("tenantId")
      .populate("paymentId");

    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    if (String(booking.ownerId) !== String(ownerId)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    res.json({ success: true, booking });
  } catch (err) {
    console.error("Get Booking Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/dashboard/owner/bookings/:id/status
exports.updateBookingStatus = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { id } = req.params;
    const { status, cancelReason } = req.body;

    const allowedStatuses = ["pending", "confirmed", "cancelled", "completed"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const booking = await Booking.findById(id).populate("paymentId");
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    if (String(booking.ownerId) !== String(ownerId)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    // Validate transitions (basic)
    if (booking.status === "cancelled" && status !== "pending") {
      // cannot change cancelled to other except pending by business rules (you can adapt)
    }

    // update booking fields
    booking.status = status;
    if (status === "cancelled") booking.cancelReason = cancelReason || null;
    if (status === "completed") booking.completedAt = new Date();

    await booking.save();

    // If cancelled and payment exists & was paid -> mark payment refunded (simple flow)
    if (status === "cancelled" && booking.paymentId && booking.paymentId.status === "success") {
      await Payment.findByIdAndUpdate(booking.paymentId._id, { status: "refunded" });
    }

    // If completed, mark payment paid (if exists)
    if (status === "completed" && booking.paymentId && booking.paymentId.status !== "success") {
      await Payment.findByIdAndUpdate(booking.paymentId._id, { status: "success", paymentDate: new Date() });
    }

    const updated = await Booking.findById(id)
      .populate({
        path: "propertyId",
        select: "title price locationId images"
      })
      .populate({
        path: "tenantId",
        select: "fullName email phone"
      })
      .populate({
        path: "paymentId",
        select: "amount status paymentDate paymentMethod transactionId"
      });

    return res.json({ success: true, booking: updated });
  } catch (err) {
    console.error("Update Booking Status Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//==========Payment
exports.getOwnerPayments = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const {
      page = 1,
      limit = 10,
      status,
      method,
      dateFrom,
      dateTo,
      search = "",
      sort = "-paymentDate"
    } = req.query;

    const filters = { receiverId: ownerId };

    if (status) filters.status = status;
    if (method) filters.paymentMethod = method;

    if (dateFrom || dateTo) {
      filters.paymentDate = {};
      if (dateFrom) filters.paymentDate.$gte = new Date(dateFrom);
      if (dateTo) filters.paymentDate.$lte = new Date(dateTo);
    }

    // Search by transactionId or amount
    if (search) {
      filters.$or = [
        { transactionId: { $regex: search, $options: "i" } },
        { amount: Number(search) || -1 }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const payments = await Payment.find(filters)
      .populate({
        path: "bookingId",
        populate: { path: "propertyId", select: "title price" }
      })
      .populate({
        path: "payerId",
        select: "fullName email phone"
      })
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Payment.countDocuments(filters);

    res.json({
      success: true,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      },
      payments
    });

  } catch (err) {
    console.error("Owner Payments Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//==========Reviews
// GET /api/dashboard/owner/reviews
exports.getOwnerReviews = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const {
      page = 1,
      limit = 10,
      search = "",
      rating,
      dateFrom,
      dateTo,
      sort = "-createdAt"
    } = req.query;

    // find properties owned by owner
    const ownerProps = await Property.find({ ownerId }).select("_id");
    const propIds = ownerProps.map(p => p._id);

    const filters = { propertyId: { $in: propIds } };

    if (rating) filters.rating = Number(rating);

    if (dateFrom || dateTo) {
      filters.createdAt = {};
      if (dateFrom) filters.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filters.createdAt.$lte = new Date(dateTo);
    }

    if (search) {
      // search in comment or reviewer name/email
      const users = await User.find({
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } }
        ]
      }).select("_id");
      const userIds = users.map(u => u._id);

      filters.$or = [
        { comment: { $regex: search, $options: "i" } },
        { userId: { $in: userIds } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const reviews = await Review.find(filters)
      .populate({ path: "propertyId", select: "title" })
      .populate({ path: "userId", select: "fullName email" })
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments(filters);

    res.json({
      success: true,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      },
      reviews
    });

  } catch (err) {
    console.error("Owner Reviews Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/dashboard/owner/reviews/summary
// returns overall average rating, total reviews, per-property averages (optional)
exports.getOwnerReviewsSummary = async (req, res) => {
  try {
    const ownerId = req.user.id;

    // get properties of owner
    const ownerProps = await Property.find({ ownerId }).select("_id title");
    const propIds = ownerProps.map(p => p._id);

    // overall avg and count
    const overall = await Review.aggregate([
      { $match: { propertyId: { $in: propIds } } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    const overallAvg = overall[0]?.avgRating ? Number(overall[0].avgRating.toFixed(2)) : 0;
    const totalReviews = overall[0]?.totalReviews || 0;

    // per-property average (top 10)
    const perProperty = await Review.aggregate([
      { $match: { propertyId: { $in: propIds } } },
      {
        $group: {
          _id: "$propertyId",
          avgRating: { $avg: "$rating" },
          reviewsCount: { $sum: 1 }
        }
      },
      { $sort: { avgRating: -1, reviewsCount: -1 } },
      { $limit: 50 } // limit to 50 properties
    ]);

    // attach property titles
    const propMap = {};
    ownerProps.forEach(p => { propMap[p._id.toString()] = p.title; });

    const perPropertyFormatted = perProperty.map(p => ({
      propertyId: p._id,
      title: propMap[p._id.toString()] || "",
      avgRating: Number(p.avgRating.toFixed(2)),
      reviewsCount: p.reviewsCount
    }));

    res.json({
      success: true,
      summary: {
        overallAvg,
        totalReviews,
        perProperty: perPropertyFormatted
      }
    });

  } catch (err) {
    console.error("Owner Reviews Summary Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
