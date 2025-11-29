const PropertyVisit = require('../models/PropertyVisit');

// Create Property Visit
exports.createPropertyVisit = async (req, res) => {
  try {
    const { userId, propertyId, visitDate, status } = req.body;

    const propertyVisit = new PropertyVisit({
      userId,
      propertyId,
      visitDate,
      status: status || "pending"
    });

    await propertyVisit.save();
    res.status(201).json({ message: "Property visit scheduled successfully", propertyVisit });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all Property Visits
exports.getPropertyVisits = async (req, res) => {
  try {
    const visits = await PropertyVisit.find()
      .populate('userId', 'fullName email')
      .populate('propertyId', 'title');
    res.status(200).json(visits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Property Visit by ID
exports.getPropertyVisitById = async (req, res) => {
  try {
    const visit = await PropertyVisit.findById(req.params.id)
      .populate('userId', 'fullName email')
      .populate('propertyId', 'title');
    if (!visit) return res.status(404).json({ message: "Property visit not found" });
    res.status(200).json(visit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Property Visit
exports.updatePropertyVisit = async (req, res) => {
  try {
    const updates = req.body;
    const visit = await PropertyVisit.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!visit) return res.status(404).json({ message: "Property visit not found" });

    res.status(200).json({ message: "Property visit updated", visit });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Property Visit
exports.deletePropertyVisit = async (req, res) => {
  try {
    const visit = await PropertyVisit.findByIdAndDelete(req.params.id);
    if (!visit) return res.status(404).json({ message: "Property visit not found" });

    res.status(200).json({ message: "Property visit deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
