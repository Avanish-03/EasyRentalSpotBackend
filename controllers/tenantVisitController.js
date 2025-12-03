// controllers/tenantVisitController.js
const PropertyVisit = require("../models/PropertyVisit");
const Property = require("../models/Property");
const createNotification = require("../utils/createNotification");
const mongoose = require("mongoose");

// POST /api/tenant/visits  (Create visit request)
exports.createVisitRequest = async (req, res) => {
  try {
    const tenantId = req.user.id;
    const { propertyId, visitDate, visitTime, notes } = req.body;

    if (!propertyId || !visitDate) {
      return res.status(400).json({ success:false, message:"propertyId & visitDate required" });
    }

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ success:false, message:"Invalid propertyId" });
    }

    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ success:false, message:"Property not found" });

    // Prevent duplicate visits for same day for same tenant
    const existing = await PropertyVisit.findOne({
      propertyId,
      visitorId: tenantId,
      visitDate: new Date(visitDate)
    });

    if (existing) {
      return res.status(409).json({ success:false, message:"You already requested a visit for this date." });
    }

    const visit = await PropertyVisit.create({
      propertyId,
      visitorId: tenantId,
      ownerId: property.ownerId,
      visitDate: new Date(visitDate),
      visitTime: visitTime || "",
      status: "pending",
      notes: notes || ""
    });

    // Notify owner
    await createNotification(
      property.ownerId,
      "message",
      "New Property Visit Request",
      `A tenant requested a visit for property "${property.title}".`,
      { visitId: visit._id, propertyId }
    );

    res.status(201).json({ success: true, visit });
  } catch (err) {
    console.error("createVisitRequest err:", err);
    res.status(500).json({ success:false, message:"Server error" });
  }
};

// GET /api/tenant/visits (tenant’s visits)
exports.getMyVisits = async (req, res) => {
  try {
    const tenantId = req.user.id;
    const { page = 1, limit = 10, status, sort = "-createdAt" } = req.query;

    const filters = { visitorId: tenantId };
    if (status) filters.status = status;

    const skip = (page - 1) * limit;

    const visits = await PropertyVisit.find(filters)
      .populate("propertyId", "title images locationId")
      .populate("ownerId", "fullName email phone")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await PropertyVisit.countDocuments(filters);

    res.json({
      success: true,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      },
      visits
    });

  } catch (err) {
    console.error("getMyVisits err:", err);
    res.status(500).json({ success:false, message:"Server error" });
  }
};

// GET /api/tenant/visits/:id  (visit details)
exports.getVisitById = async (req, res) => {
  try {
    const tenantId = req.user.id;
    const { id } = req.params;

    const visit = await PropertyVisit.findById(id)
      .populate("propertyId")
      .populate("ownerId", "fullName email phone");

    if (!visit) return res.status(404).json({ success:false, message:"Visit not found" });
    if (String(visit.visitorId) !== String(tenantId)) {
      return res.status(403).json({ success:false, message:"Forbidden" });
    }

    res.json({ success:true, visit });

  } catch (err) {
    console.error("getVisitById err:", err);
    res.status(500).json({ success:false, message:"Server error" });
  }
};

// PUT /api/tenant/visits/:id/cancel
exports.cancelVisit = async (req, res) => {
  try {
    const tenantId = req.user.id;
    const { id } = req.params;
    const { reason } = req.body;

    const visit = await PropertyVisit.findById(id);
    if (!visit) return res.status(404).json({ success:false, message:"Visit not found" });
    if (String(visit.visitorId) !== String(tenantId)) {
      return res.status(403).json({ success:false, message:"Forbidden" });
    }

    if (["completed", "cancelled"].includes(visit.status)) {
      return res.status(400).json({ success:false, message:"Cannot cancel this visit" });
    }

    visit.status = "cancelled";
    visit.cancelReason = reason || "";
    await visit.save();

    // Notify owner
    await createNotification(
      visit.ownerId,
      "message",
      "Property Visit Cancelled",
      `A tenant cancelled their scheduled visit.`,
      { visitId: visit._id }
    );

    res.json({ success:true, message:"Visit cancelled", visit });

  } catch (err) {
    console.error("cancelVisit err:", err);
    res.status(500).json({ success:false, message:"Server error" });
  }
};
