// controllers/tenantPropertyController.js
const Property = require("../models/Property");
const PropertyImage = require("../models/PropertyImage");
const Location = require("../models/Location");
const Amenity = require("../models/Amenity");
const Review = require("../models/Review");
const Booking = require("../models/Booking");
const mongoose = require("mongoose");

// GET /api/tenant/properties
// query: page, limit, search, minPrice, maxPrice, city, amenityIds (csv), propertyType, sort
exports.getProperties = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = "",
      minPrice,
      maxPrice,
      city,
      amenityIds,
      propertyType,
      sort = "-createdAt"
    } = req.query;

    const filters = { approvalStatus: "approved", status: "available" };

    if (search) filters.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ];

    if (minPrice) filters.price = { ...filters.price, $gte: Number(minPrice) };
    if (maxPrice) filters.price = { ...filters.price, $lte: Number(maxPrice) };
    if (propertyType) filters.propertyType = propertyType;

    if (city) {
      // join with location -> we have locationId; find location ids by city
      const locs = await Location.find({ city: { $regex: `^${city}$`, $options: "i" } }).select("_id");
      const locIds = locs.map(l => l._id);
      filters.locationId = { $in: locIds };
    }

    if (amenityIds) {
      const arr = String(amenityIds).split(",").filter(Boolean).map(id => mongoose.Types.ObjectId(id));
      if (arr.length) filters.amenityIds = { $all: arr };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [properties, total] = await Promise.all([
      Property.find(filters)
        .populate("locationId", "city area fullAddress")
        .populate("amenityIds", "name icon")
        .populate({ path: "images", select: "imageUrl isPrimary order" })
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Property.countDocuments(filters)
    ]);

    res.json({
      success: true,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      },
      properties
    });
  } catch (err) {
    console.error("Tenant getProperties err:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/tenant/properties/:id
// returns property + avgRating + recentReviews + availability basic (bookings overlap check)
exports.getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success:false, message:"Invalid id" });

    const property = await Property.findById(id)
      .populate("locationId", "city area fullAddress")
      .populate("amenityIds", "name icon")
      .populate({ path: "images", select: "imageUrl isPrimary order" })
      .populate({ path: "ownerId", select: "fullName email phone avatar" });

    if (!property) return res.status(404).json({ success:false, message:"Property not found" });

    // avg rating & recent reviews
    const ratingAgg = await Review.aggregate([
      { $match: { propertyId: property._id } },
      { $group: { _id: null, avgRating: { $avg: "$rating" }, total: { $sum: 1 } } }
    ]);

    const avgRating = ratingAgg[0]?.avgRating ? Number(ratingAgg[0].avgRating.toFixed(2)) : 0;
    const ratingCount = ratingAgg[0]?.total || 0;

    const recentReviews = await Review.find({ propertyId: property._id })
      .sort("-createdAt")
      .limit(5)
      .populate("userId", "fullName avatar");

    // basic availability check (example: check if any confirmed booking overlaps given date range — frontend must supply dates for precise check)
    // Here we'll return next booked ranges (optional)
    const upcomingBookings = await Booking.find({
      propertyId: property._id,
      status: { $in: ["pending","confirmed"] },
      bookingEndDate: { $gte: new Date() }
    }).select("bookingStartDate bookingEndDate status");

    res.json({
      success: true,
      property,
      rating: { avg: avgRating, count: ratingCount },
      recentReviews,
      upcomingBookings
    });
  } catch (err) {
    console.error("Tenant getPropertyById err:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/tenant/properties/:id/similar
exports.getSimilarProperties = async (req, res) => {
  try {
    const { id } = req.params;
    const prop = await Property.findById(id).select("locationId propertyType price amenityIds");
    if (!prop) return res.status(404).json({ success:false, message:"Property not found" });

    const filters = {
      _id: { $ne: prop._id },
      approvalStatus: "approved",
      status: "available",
      $or: [
        { propertyType: prop.propertyType },
        { locationId: prop.locationId }
      ]
    };

    const similar = await Property.find(filters)
      .populate("images")
      .limit(8);

    res.json({ success:true, similar });
  } catch (err) {
    console.error("Similar props err:", err);
    res.status(500).json({ success:false, message:"Server error" });
  }
};

// GET /api/tenant/filters - returns list of locations + amenities + propertyTypes + priceRange sample
exports.getFilterLists = async (req, res) => {
  try {
    const amenities = await Amenity.find().sort("order").select("name icon _id");
    const locations = await Location.find().select("city area _id").limit(200);
    // property types from enum - hardcode or derive
    const propertyTypes = ['apartment','house','villa','studio','other'];

    // price range: min/max from properties
    const p = await Property.aggregate([
      { $match: { approvalStatus: "approved", status: "available" } },
      { $group: { _id: null, minPrice: { $min: "$price" }, maxPrice: { $max: "$price" } } }
    ]);
    const minPrice = p[0]?.minPrice || 0;
    const maxPrice = p[0]?.maxPrice || 0;

    res.json({
      success:true,
      data: { amenities, locations, propertyTypes, priceRange: { minPrice, maxPrice } }
    });
  } catch (err) {
    console.error("getFilterLists err:", err);
    res.status(500).json({ success:false, message:"Server error" });
  }
};
