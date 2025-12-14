const Property = require("../models/Property");
const PropertyImage = require("../models/PropertyImage");
const deleteFile = require("../utils/deleteFile");
const slugify = require("../utils/slugify");

// ------------------------------------
// CREATE PROPERTY (WITH SAFE SLUG)
// ------------------------------------
exports.createProperty = async (req, res) => {
  console.log("CREATE PROPERTY API HIT");

  try {
    const ownerId = req.user.id;

    console.log("REQUEST BODY:", req.body);

    // ✅ SLUG GENERATION (MANDATORY)
    let baseSlug = slugify(req.body.title);
    let slug = baseSlug;

    const existing = await Property.findOne({ slug });
    if (existing) {
      slug = `${baseSlug}-${Date.now()}`;
    }

    const property = await Property.create({
      ...req.body,
      slug, // 👈 VERY IMPORTANT
      ownerId,
      approvalStatus: "pending",
    });

    console.log("PROPERTY SAVED");

    return res.status(201).json({
      message: "Property created. Awaiting admin approval",
      property,
    });
  } catch (err) {
    console.error("CREATE PROPERTY ERROR:", err);
    return res.status(500).json({ message: "Server error", err });
  }
};

// ------------------------------------
// UPLOAD PROPERTY IMAGES
// ------------------------------------
exports.uploadImages = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const images = await Promise.all(
      req.files.map((file) =>
        PropertyImage.create({
          propertyId,
          imageUrl: "/uploads/properties/" + file.filename,
          isPrimary: false,
        })
      )
    );

    await Property.findByIdAndUpdate(propertyId, {
      $push: { images: images.map((i) => i._id) },
      approvalStatus: "pending",
    });

    res.json({ message: "Images uploaded", images });
  } catch (err) {
    console.error("UPLOAD IMAGE ERROR:", err);
    res.status(500).json({ message: "Server error", err });
  }
};

// ------------------------------------
// DELETE IMAGE
// ------------------------------------
exports.deleteImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    const img = await PropertyImage.findById(imageId);
    if (!img) return res.status(404).json({ message: "Image not found" });

    deleteFile(img.imageUrl);
    await img.deleteOne();

    res.json({ message: "Image deleted" });
  } catch (err) {
    console.error("DELETE IMAGE ERROR:", err);
    res.status(500).json({ message: "Server error", err });
  }
};

// ------------------------------------
// UPDATE PROPERTY
// ------------------------------------
exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property)
      return res.status(404).json({ message: "Property not found" });

    if (property.ownerId.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    // ❗ slug update only if title changed
    let updatedData = { ...req.body, approvalStatus: "pending" };

    if (req.body.title && req.body.title !== property.title) {
      let baseSlug = slugify(req.body.title);
      let slug = baseSlug;

      const exists = await Property.findOne({ slug });
      if (exists) {
        slug = `${baseSlug}-${Date.now()}`;
      }

      updatedData.slug = slug;
    }

    const updated = await Property.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    res.json({ message: "Property updated", updated });
  } catch (err) {
    console.error("UPDATE PROPERTY ERROR:", err);
    res.status(500).json({ message: "Server error", err });
  }
};

// ------------------------------------
// SOFT DELETE PROPERTY
// ------------------------------------
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
    console.error("DELETE PROPERTY ERROR:", err);
    res.status(500).json({ message: "Server error", err });
  }
};

// ------------------------------------
// GET ALL OWNER PROPERTIES
// ------------------------------------
exports.getOwnerProperties = async (req, res) => {
  try {
    const properties = await Property.find({ ownerId: req.user.id })
      .populate("locationId")
      .populate("amenityIds")
      .populate("images")
      .sort({ createdAt: -1 });

    res.json({
      count: properties.length,
      properties,
    });
  } catch (err) {
    console.error("GET OWNER PROPERTIES ERROR:", err);
    res.status(500).json({ message: "Server error", err });
  }
};

// ------------------------------------
// GET SINGLE PROPERTY
// ------------------------------------
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
    console.error("GET SINGLE PROPERTY ERROR:", err);
    res.status(500).json({ message: "Server error", err });
  }
};
