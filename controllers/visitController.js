// controllers/visitController.js
const PropertyVisit = require("../models/PropertyVisit");
const Property = require("../models/Property");
const Booking = require("../models/Booking");
const Notification = require("../models/Notification");
const User = require("../models/User");

// Helper to create notification
async function createNotification(userId, type, title, message, metadata = {}) {
  try {
    return await Notification.create({
      userId,
      type,
      title,
      message,
      metadata,
      isRead: false
    });
  } catch (err) {
    console.error("Notify error:", err);
    return null;
  }
}

// Tenant: schedule a visit
// POST /api/visits
exports.createVisit = async (req, res) => {
  try {
    const visitorId = req.user.id;
    const { propertyId, visitDate, visitTime, notes } = req.body;

    if (!propertyId || !visitDate) {
      return res.status(400).json({ success: false, message: "propertyId and visitDate required" });
    }

    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ success: false, message: "Property not found" });

    const ownerId = property.ownerId;

    const visit = await PropertyVisit.create({
      propertyId,
      visitorId,
      ownerId,
      visitDate: new Date(visitDate),
      visitTime: visitTime || null,
      notes: notes || ""
    });

    // Notify owner
    createNotification(
      ownerId,
      "booking",
      "New visit request",
      `You have a new visit request for "${property.title}" on ${new Date(visitDate).toLocaleString()}`,
      { propertyId: property._id, visitId: visit._id }
    );

    res.status(201).json({ success: true, message: "Visit scheduled", visit });
  } catch (err) {
    console.error("Create Visit Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Owner: list visits
// GET /api/dashboard/owner/visits
exports.getOwnerVisits = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const {
      page = 1,
      limit = 10,
      status,
      dateFrom,
      dateTo,
      search = "",
      sort = "-visitDate"
    } = req.query;

    const filters = { ownerId };

    if (status) filters.status = status;

    if (dateFrom || dateTo) {
      filters.visitDate = {};
      if (dateFrom) filters.visitDate.$gte = new Date(dateFrom);
      if (dateTo) filters.visitDate.$lte = new Date(dateTo);
    }

    // search by property title or visitor name/email
    if (search) {
      // find matching users and properties
      const users = await User.find({
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } }
        ]
      }).select("_id");
      const userIds = users.map(u => u._id);

      const props = await Property.find({
        title: { $regex: search, $options: "i" }
      }).select("_id");
      const propIds = props.map(p => p._id);

      filters.$or = [
        { visitorId: { $in: userIds } },
        { propertyId: { $in: propIds } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const visits = await PropertyVisit.find(filters)
      .populate({ path: "propertyId", select: "title locationId images" })
      .populate({ path: "visitorId", select: "fullName email phone" })
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
    console.error("Get Owner Visits Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET single visit (owner or visitor)
// GET /api/visits/:id
exports.getVisitById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const visit = await PropertyVisit.findById(id)
      .populate({ path: "propertyId", select: "title locationId images" })
      .populate({ path: "visitorId", select: "fullName email phone" })
      .populate({ path: "ownerId", select: "fullName email phone" });

    if (!visit) return res.status(404).json({ success: false, message: "Visit not found" });

    // allow owner, visitor, admin
    if (String(visit.ownerId._id || visit.ownerId) !== String(userId) &&
        String(visit.visitorId._id || visit.visitorId) !== String(userId) &&
        req.user.role !== "Admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    res.json({ success: true, visit });
  } catch (err) {
    console.error("Get Visit Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Owner: update visit status, optionally convert to booking
// PUT /api/dashboard/owner/visits/:id/status
exports.updateVisitStatus = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { id } = req.params;
    const { status, notes, convertToBooking = false, bookingStartDate, bookingEndDate, totalAmount } = req.body;

    const allowed = ["pending", "confirmed", "completed", "cancelled"];
    if (!allowed.includes(status)) return res.status(400).json({ success: false, message: "Invalid status" });

    const visit = await PropertyVisit.findById(id);
    if (!visit) return res.status(404).json({ success: false, message: "Visit not found" });

    if (String(visit.ownerId) !== String(ownerId)) return res.status(403).json({ success: false, message: "Forbidden" });

    visit.status = status;
    if (notes) visit.notes = notes;
    if (status === "completed") visit.reminderSent = false; // reset reminder flag if needed
    if (status === "confirmed") {
      // notify visitor about confirmation
      createNotification(
        visit.visitorId,
        "booking",
        "Visit confirmed",
        `Your visit for property has been confirmed for ${new Date(visit.visitDate).toLocaleString()}`,
        { visitId: visit._id, propertyId: visit.propertyId }
      );
    }

    // convert to booking logic (optional)
    let createdBooking = null;
    if (convertToBooking) {
      // require booking dates + amount
      if (!bookingStartDate || !bookingEndDate || !totalAmount) {
        return res.status(400).json({ success: false, message: "bookingStartDate, bookingEndDate and totalAmount required to create booking" });
      }

      const booking = await Booking.create({
        propertyId: visit.propertyId,
        tenantId: visit.visitorId,
        ownerId: visit.ownerId,
        bookingType: "rental",
        visitId: visit._id,
        bookingStartDate: new Date(bookingStartDate),
        bookingEndDate: new Date(bookingEndDate),
        status: "pending",
        totalAmount,
        paymentStatus: "unpaid"
      });

      visit.convertedToBooking = true;
      visit.bookingId = booking._id; // bookingId field not present in visit schema earlier, safe to attach dynamic field; if you prefer, ignore or add schema field
      createdBooking = booking;

      // notify tenant about created booking
      createNotification(
        visit.visitorId,
        "booking",
        "Booking created from visit",
        `A booking has been created for property. Please complete payment to confirm the booking.`,
        { bookingId: booking._id, visitId: visit._id }
      );

      // notify owner about booking creation
      createNotification(
        visit.ownerId,
        "booking",
        "Booking created",
        `A booking has been created from the visit for property.`,
        { bookingId: booking._id, visitId: visit._id }
      );
    }

    await visit.save();

    const populated = await PropertyVisit.findById(visit._id)
      .populate({ path: "propertyId", select: "title" })
      .populate({ path: "visitorId", select: "fullName email phone" });

    return res.json({ success: true, visit: populated, createdBooking });
  } catch (err) {
    console.error("Update Visit Status Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
