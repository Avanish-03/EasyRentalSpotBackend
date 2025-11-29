const Property = require('../models/Property');

// Create Property
exports.createProperty = async (req, res) => {
  try {
    const { title, description, price, location, ownerId, amenities } = req.body;

    const property = new Property({
      title,
      description,
      price,
      location,
      ownerId,
      amenities
    });

    await property.save();
    res.status(201).json({ message: "Property created successfully", property });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all Properties
exports.getProperties = async (req, res) => {
  try {
    const properties = await Property.find()
      .populate('ownerId', 'fullName email')
      .populate('amenities', 'name');
    res.status(200).json(properties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Property by ID
exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('ownerId', 'fullName email')
      .populate('amenities', 'name');
    if (!property) return res.status(404).json({ message: "Property not found" });
    res.status(200).json(property);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Property
exports.updateProperty = async (req, res) => {
  try {
    const updates = req.body;
    const property = await Property.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!property) return res.status(404).json({ message: "Property not found" });

    res.status(200).json({ message: "Property updated", property });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Property
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    res.status(200).json({ message: "Property deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
