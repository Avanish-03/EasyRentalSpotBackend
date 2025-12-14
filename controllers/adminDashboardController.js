// controllers/adminDashboardController.js
const User = require("../models/User");
const Property = require("../models/Property");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const PropertyVisit = require("../models/PropertyVisit");
const Report = require("../models/Report");
const mongoose = require("mongoose");

// ----------------------------------------------------------------------------------
//  TOTAL COUNTS (cards)
// GET /api/admin/dashboard/summary
// ----------------------------------------------------------------------------------
exports.getSummary = async (req, res) => {
  try {
    const [
      totalUsers,
      totalOwners,
      totalTenants,
      totalProperties,
      pendingProperties,
      totalBookings,
      pendingBookings,
      totalRevenue
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ roleName: "Owner" }),
      User.countDocuments({ roleName: "Tenant" }),
      Property.countDocuments(),
      Property.countDocuments({ status: "pending" }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: "pending" }),
      Payment.aggregate([
        { $match: { status: "success" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ])
    ]);

    res.json({
      success: true,
      summary: {
        users: totalUsers,
        owners: totalOwners,
        tenants: totalTenants,
        properties: totalProperties,
        pendingProperties,
        bookings: totalBookings,
        pendingBookings,
        revenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (err) {
    console.error("Admin getSummary err:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------------------------------
// DAILY BOOKINGS CHART
// GET /api/admin/dashboard/bookings-trend?days=30
// ----------------------------------------------------------------------------------
exports.getBookingsTrend = async (req, res) => {
  try {
    const days = Number(req.query.days) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const data = await Booking.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    const formatted = data.map(d => ({
      date: `${d._id.year}-${d._id.month}-${d._id.day}`,
      count: d.count
    }));

    res.json({ success: true, trend: formatted });
  } catch (err) {
    console.error("Admin getBookingsTrend err:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------------------------------
// REVENUE TREND (daily)
// GET /api/admin/dashboard/revenue-trend?days=30
// ----------------------------------------------------------------------------------
exports.getRevenueTrend = async (req, res) => {
  try {
    const days = Number(req.query.days) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const data = await Payment.aggregate([
      { $match: { status: "success", createdAt: { $gte: since } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          revenue: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    const formatted = data.map(d => ({
      date: `${d._id.year}-${d._id.month}-${d._id.day}`,
      revenue: d.revenue
    }));

    res.json({ success: true, trend: formatted });
  } catch (err) {
    console.error("revenueTrend err:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------------------------------
// PROPERTY STATUS COUNTS
// GET /api/admin/dashboard/property-status
// ----------------------------------------------------------------------------------
exports.getPropertyStatusStats = async (req, res) => {
  try {
    const data = await Property.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    res.json({ success: true, stats: data });
  } catch (err) {
    console.error("PropertyStatus err:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------------------------------
// TOP OWNERS BY BOOKINGS (leaderboard)
// GET /api/admin/dashboard/top-owners
// ----------------------------------------------------------------------------------
exports.getTopOwners = async (req, res) => {
  try {
    const data = await Booking.aggregate([
      { $group: { _id: "$ownerId", totalBookings: { $sum: 1 } } },
      { $sort: { totalBookings: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "owner"
        }
      },
      { $unwind: "$owner" },
      {
        $project: {
          ownerName: "$owner.fullName",
          totalBookings: 1
        }
      }
    ]);

    res.json({ success: true, owners: data });
  } catch (err) {
    console.error("TopOwners err:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------------------------------
// PENDING REPORTS COUNT
// GET /api/admin/dashboard/reports
// ----------------------------------------------------------------------------------
exports.getReportStats = async (req, res) => {
  try {
    const pending = await Report.countDocuments({ status: "pending" });
    const resolved = await Report.countDocuments({ status: "resolved" });

    res.json({ success: true, reports: { pending, resolved } });
  } catch (err) {
    console.error("ReportStats err:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
