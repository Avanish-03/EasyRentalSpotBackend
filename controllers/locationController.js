const Location = require("../models/Location");

/**
 * CREATE LOCATION
 */
exports.createLocation = async (req, res) => {
  try {
    const location = await Location.create(req.body);

    res.status(201).json({
      success: true,
      location
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET ALL LOCATIONS (for dropdown)
 */
exports.getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find().sort({ city: 1 });

    res.json({
      success: true,
      locations
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
