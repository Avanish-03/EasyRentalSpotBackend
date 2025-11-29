const Location = require('../models/Location');

// Create Location
exports.createLocation = async (req, res) => {
  try {
    const { name, city, state, country, zipCode } = req.body;

    const location = new Location({ name, city, state, country, zipCode });
    await location.save();

    res.status(201).json({ message: "Location created successfully", location });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all Locations
exports.getLocations = async (req, res) => {
  try {
    const locations = await Location.find();
    res.status(200).json(locations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Location by ID
exports.getLocationById = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) return res.status(404).json({ message: "Location not found" });
    res.status(200).json(location);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Location
exports.updateLocation = async (req, res) => {
  try {
    const updates = req.body;
    const location = await Location.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!location) return res.status(404).json({ message: "Location not found" });

    res.status(200).json({ message: "Location updated", location });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Location
exports.deleteLocation = async (req, res) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);
    if (!location) return res.status(404).json({ message: "Location not found" });

    res.status(200).json({ message: "Location deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
