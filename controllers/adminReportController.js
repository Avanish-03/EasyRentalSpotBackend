const Report = require("../models/Report");
const User = require("../models/User");
const Property = require("../models/Property");
const Booking = require("../models/Booking");
const mongoose = require("mongoose");

// GET /api/admin/reports  (list all reports)
exports.getAllReports = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      search = "",
      sort = "-createdAt"
    } = req.query;

    const filters = {};

    if (status) filters.status = status;
    if (type) filters.type = type;

    // search reporter or target username or property title
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
        { reporterId: { $in: userIds }},
        { targetUserId: { $in: userIds }},
        { propertyId: { $in: propIds }}
      ];
    }

    const skip = (page - 1) * limit;

    const reports = await Report.find(filters)
      .populate("reporterId", "fullName email")
      .populate("targetUserId", "fullName email")
      .populate("propertyId", "title")
      .populate("bookingId")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Report.countDocuments(filters);

    res.json({
      success: true,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
      reports,
    });

  } catch (err) {
    console.error("Admin getAllReports:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/admin/reports/:id
exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate("reporterId", "fullName email")
      .populate("targetUserId", "fullName email")
      .populate("propertyId", "title")
      .populate("bookingId");

    if (!report)
      return res.status(404).json({ success: false, message: "Report not found" });

    res.json({ success: true, report });

  } catch (err) {
    console.error("Admin getReportById:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/admin/reports/:id/status  (resolve / reject / reviewing)
exports.updateReportStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const allowed = ["pending", "reviewing", "resolved", "rejected"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const report = await Report.findById(req.params.id);
    if (!report)
      return res.status(404).json({ success: false, message: "Report not found" });

    report.status = status;
    report.adminNote = adminNote || "";

    await report.save();

    res.json({ success: true, message: "Report updated", report });

  } catch (err) {
    console.error("Admin updateReportStatus:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /api/admin/reports/:id
exports.deleteReport = async (req, res) => {
  try {
    const deleted = await Report.findByIdAndDelete(req.params.id);

    if (!deleted)
      return res.status(404).json({ success: false, message: "Report not found" });

    res.json({ success: true, message: "Report deleted" });

  } catch (err) {
    console.error("Admin deleteReport:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
