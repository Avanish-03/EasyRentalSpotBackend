// controllers/tenantDashboardController.js
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const PropertyVisit = require("../models/PropertyVisit");
const Notification = require("../models/Notification");
const Review = require("../models/Review");
const Subscription = require("../models/Subscription");
const dayjs = require("dayjs");

exports.getTenantDashboard = async (req, res) => {
  try {
    const tenantId = req.user.id;

    // 1) Total bookings (all)
    const totalBookings = await Booking.countDocuments({ tenantId });

    // 2) Active / upcoming bookings (confirmed and bookingEndDate in future)
    const activeBookings = await Booking.countDocuments({
      tenantId,
      status: { $in: ["confirmed"] },
      bookingEndDate: { $gte: new Date() }
    });

    // 3) Pending booking requests
    const pendingBookings = await Booking.countDocuments({ tenantId, status: "pending" });

    // 4) Upcoming visits (next 5)
    const upcomingVisits = await PropertyVisit.find({
      visitorId: tenantId,
      visitDate: { $gte: new Date() },
      status: { $ne: "cancelled" }
    })
      .sort("visitDate")
      .limit(5)
      .populate("propertyId", "title images");

    const upcomingVisitsCount = await PropertyVisit.countDocuments({
      visitorId: tenantId,
      visitDate: { $gte: new Date() },
      status: { $ne: "cancelled" }
    });

    // 5) Pending payments (payments with status pending for this tenant)
    const pendingPayments = await Payment.countDocuments({ payerId: tenantId, status: "pending" });

    // 6) Total amount spent (successful payments)
    const spentAgg = await Payment.aggregate([
      { $match: { payerId: tenantId, status: "success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalSpent = spentAgg[0]?.total || 0;

    // 7) Recent bookings (last 5)
    const recentBookings = await Booking.find({ tenantId })
      .sort("-createdAt")
      .limit(5)
      .populate({ path: "propertyId", select: "title images" })
      .populate({ path: "ownerId", select: "fullName" });

    // 8) Unread notifications count
    const unreadNotifications = await Notification.countDocuments({ userId: tenantId, isRead: false });

    // 9) Reviews written count
    const myReviewsCount = await Review.countDocuments({ userId: tenantId });

    // 10) Active subscription (if tenant subscriptions exist)
    const activeSub = await Subscription.findOne({
      userId: tenantId,
      isActive: true,
      endDate: { $gte: new Date() }
    });

    const subscriptionInfo = activeSub
      ? {
          active: true,
          planName: activeSub.planName,
          planType: activeSub.planType,
          endDate: activeSub.endDate
        }
      : { active: false };

    // Response
    return res.json({
      success: true,
      dashboard: {
        bookings: {
          total: totalBookings,
          active: activeBookings,
          pending: pendingBookings,
          recent: recentBookings
        },
        visits: {
          upcomingCount: upcomingVisitsCount,
          upcoming: upcomingVisits
        },
        payments: {
          pending: pendingPayments,
          totalSpent
        },
        notifications: {
          unread: unreadNotifications
        },
        reviews: {
          written: myReviewsCount
        },
        subscription: subscriptionInfo
      }
    });
  } catch (err) {
    console.error("Tenant Dashboard Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
