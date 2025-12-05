const PropertyVisit = require("../models/PropertyVisit");
const Property = require("../models/Property");

// Create visit request
exports.createVisit = async (req, res) => {
  try {
    const tenantId = req.user.id;
    const { propertyId, visitDate, visitTime, notes } = req.body;

    if (!propertyId || !visitDate)
      return res.status(400).json({ success: false, message: "propertyId and visitDate required" });

    const property = await Property.findById(propertyId);
    if (!property)
      return res.status(404).json({ success: false, message: "Property not found" });

    const visit = await PropertyVisit.create({
      propertyId,
      visitorId: tenantId,
      ownerId: property.ownerId,
      visitDate,
      visitTime,
      notes,
      status: "pending"
    });

    return res.status(201).json({ success: true, message: "Visit requested", visit });
  } catch (err) {
    console.error("Create Visit Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all my visits
exports.getMyVisits = async (req, res) => {
  try {
    const tenantId = req.user.id;

    const visits = await PropertyVisit.find({ visitorId: tenantId })
      .populate({ path: "propertyId", select: "title images locationId" })
      .populate({ path: "ownerId", select: "fullName email phone" })
      .sort("-createdAt");

    res.json({ success: true, visits });
  } catch (err) {
    console.error("Get Visits Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get visit by ID
exports.getVisitById = async (req, res) => {
  try {
    const tenantId = req.user.id;
    const { id } = req.params;

    const visit = await PropertyVisit.findOne({ _id: id, visitorId: tenantId })
      .populate("propertyId")
      .populate("ownerId");

    if (!visit)
      return res.status(404).json({ success: false, message: "Visit not found" });

    res.json({ success: true, visit });
  } catch (err) {
    console.error("Get Visit By ID Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Cancel visit
exports.cancelVisit = async (req, res) => {
  try {
    const tenantId = req.user.id;
    const { id } = req.params;

    const visit = await PropertyVisit.findOne({ _id: id, visitorId: tenantId });

    if (!visit)
      return res.status(404).json({ success: false, message: "Visit not found" });

    if (visit.status === "completed")
      return res.status(400).json({ success: false, message: "Completed visit cannot be cancelled" });

    visit.status = "cancelled";
    await visit.save();

    res.json({ success: true, message: "Visit cancelled", visit });
  } catch (err) {
    console.error("Cancel Visit Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
