const Property = require("../models/Property");
const PropertyImage = require("../models/PropertyImage");
const deleteFile = require("../utils/deleteFile");

// CREATE PROPERTY
exports.createProperty = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const property = await Property.create({
      ...req.body,
      ownerId,
      approvalStatus: "pending"
    });

    res.status(201).json({
      message: "Property created. Awaiting admin approval",
      property,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

// UPLOAD IMAGES
exports.uploadImages = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;

    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: "No images uploaded" });

    const images = await Promise.all(
      req.files.map((file) =>
        PropertyImage.create({
          propertyId,
          imageUrl: "/uploads/properties/" + file.filename,
          isPrimary: false,
        })
      )
    );

    // Add images to property
    await Property.findByIdAndUpdate(propertyId, {
      $push: { images: images.map((i) => i._id) },
      approvalStatus: "pending",
    });

    res.json({ message: "Images uploaded", images });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

// DELETE IMAGE
exports.deleteImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    const img = await PropertyImage.findById(imageId);
    if (!img) return res.status(404).json({ message: "Image not found" });

    deleteFile(img.imageUrl);
    await img.remove();

    res.json({ message: "Image deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

// UPDATE PROPERTY
exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property)
      return res.status(404).json({ message: "Property not found" });

    if (property.ownerId.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    const updated = await Property.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        approvalStatus: "pending",
      },
      { new: true }
    );

    res.json({ message: "Property updated", updated });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

// SOFT DELETE PROPERTY
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property)
      return res.status(404).json({ message: "Property not found" });

    if (property.ownerId.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    property.status = "inactive";
    await property.save();

    res.json({ message: "Property deleted (soft)" });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

// GET ALL OWNER PROPERTIES
exports.getOwnerProperties = async (req, res) => {
  try {
    const properties = await Property.find({ ownerId: req.user.id })
      .populate("locationId")
      .populate("amenityIds")
      .populate("images");

    res.json({ count: properties.length, properties });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

// GET SINGLE PROPERTY
exports.getSingleProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate("locationId")
      .populate("amenityIds")
      .populate("images");

    if (!property)
      return res.status(404).json({ message: "Property not found" });

    res.json(property);
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};
