// controllers/adminPropertyController.js
const Property = require("../models/Property");
const User = require("../models/User");
const mongoose = require("mongoose");
const { sendNotification } = require("../services/notificationService");

// Helpers
const VALID_STATUSES = ["available", "booked", "under_maintenance", "inactive"];

// GET /api/admin/properties
exports.getAllProperties = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      approvalStatus,
      status,
      sort = "-createdAt"
    } = req.query;

    const filters = {};

    if (approvalStatus) filters.approvalStatus = approvalStatus;
    if (status) filters.status = status;

    if (search) {
      filters.title = { $regex: search, $options: "i" };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [properties, total] = await Promise.all([
      Property.find(filters)
        .populate("ownerId", "fullName email phone")
        .populate("amenityIds")
        .populate("locationId")
        .populate("images")
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Property.countDocuments(filters)
    ]);

    res.json({
      success: true,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      },
      properties
    });
  } catch (err) {
    console.error("getAllProperties err:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/admin/properties/:id
exports.getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid property id" });
    }

    const property = await Property.findById(id)
      .populate("ownerId", "fullName email phone")
      .populate("amenityIds")
      .populate("locationId")
      .populate("images");

    if (!property) return res.status(404).json({ success: false, message: "Property not found" });

    res.json({ success: true, property });
  } catch (err) {
    console.error("getPropertyById err:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/admin/properties/pending
exports.getPendingProperties = async (req, res) => {
  try {
    const properties = await Property.find({ approvalStatus: "pending" })
      .populate("ownerId", "fullName email phone")
      .populate("locationId")
      .populate("amenityIds")
      .sort("-createdAt");

    res.json({ success: true, properties });
  } catch (err) {
    console.error("getPendingProperties err:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/admin/properties/:id/approve
exports.approveProperty = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid property id" });
    }

    const property = await Property.findById(id);
    if (!property) return res.status(404).json({ success: false, message: "Property not found" });

    property.approvalStatus = "approved";
    property.rejectionReason = null;
    // Make property available on approval (owner might change later)
    property.status = "available";
    // optional admin note: req.body.adminComment
    if (req.body.adminComment) property.adminComment = req.body.adminComment;

    await property.save();

    // Notify owner
    await sendNotification(
      property.ownerId,
      "system",
      "Property Approved",
      `Your property "${property.title}" has been approved and is now visible to tenants.`,
      { propertyId: property._id.toString() }
    );

    res.json({ success: true, message: "Property approved", property });
  } catch (err) {
    console.error("approveProperty err:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/admin/properties/:id/reject
exports.rejectProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, adminComment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid property id" });
    }

    if (!reason || typeof reason !== "string") {
      return res.status(400).json({ success: false, message: "Rejection reason required" });
    }

    const property = await Property.findById(id);
    if (!property) return res.status(404).json({ success: false, message: "Property not found" });

    property.approvalStatus = "rejected";
    property.rejectionReason = reason;
    property.status = "inactive";
    if (adminComment) property.adminComment = adminComment;

    await property.save();

    // Notify owner
    await sendNotification(
      property.ownerId,
      "system",
      "Property Rejected",
      `Your property "${property.title}" was rejected by admin. Reason: ${reason}`,
      { propertyId: property._id.toString() }
    );

    res.json({ success: true, message: "Property rejected", property });
  } catch (err) {
    console.error("rejectProperty err:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/admin/properties/:id/status
exports.togglePropertyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid property id" });
    }

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Allowed: ${VALID_STATUSES.join(", ")}` });
    }

    const property = await Property.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!property) return res.status(404).json({ success: false, message: "Property not found" });

    res.json({
      success: true,
      message: `Property marked as ${status}`,
      property
    });
  } catch (err) {
    console.error("togglePropertyStatus err:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /api/admin/properties/:id
exports.deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid property id" });
    }

    const deleted = await Property.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: "Property not found" });

    // notify owner about deletion (optional)
    await sendNotification(
      deleted.ownerId,
      "system",
      "Property Deleted by Admin",
      `Your property "${deleted.title}" was removed by admin.`,
      { propertyId: deleted._id.toString() }
    );

    res.json({ success: true, message: "Property deleted" });
  } catch (err) {
    console.error("deleteProperty err:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
