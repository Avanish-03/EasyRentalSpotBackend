const Amenity = require('../models/Amenity');

// Create Amenity
exports.createAmenity = async (req, res) => {
  try {
    const { name, description } = req.body;

    const amenity = new Amenity({ name, description });
    await amenity.save();

    res.status(201).json({ message: "Amenity created successfully", amenity });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all Amenities
exports.getAmenities = async (req, res) => {
  try {
    const amenities = await Amenity.find();
    res.status(200).json(amenities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Amenity by ID
exports.getAmenityById = async (req, res) => {
  try {
    const amenity = await Amenity.findById(req.params.id);
    if (!amenity) return res.status(404).json({ message: "Amenity not found" });
    res.status(200).json(amenity);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Amenity
exports.updateAmenity = async (req, res) => {
  try {
    const updates = req.body;
    const amenity = await Amenity.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!amenity) return res.status(404).json({ message: "Amenity not found" });

    res.status(200).json({ message: "Amenity updated", amenity });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Amenity
exports.deleteAmenity = async (req, res) => {
  try {
    const amenity = await Amenity.findByIdAndDelete(req.params.id);
    if (!amenity) return res.status(404).json({ message: "Amenity not found" });

    res.status(200).json({ message: "Amenity deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
