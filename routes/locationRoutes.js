const express = require("express");
const router = express.Router();
const {
  createLocation,
  getAllLocations
} = require("../controllers/locationController");

// POST - create location
router.post("/", createLocation);

// GET - all locations (dropdown)
router.get("/", getAllLocations);

module.exports = router;
