// controllers/tenantReviewController.js
const Review = require("../models/Review");
const Booking = require("../models/Booking");
const Property = require("../models/Property");
const mongoose = require("mongoose");

// POST /api/tenant/reviews (Add review)
exports.addReview = async (req, res) => {
  try {
    const tenantId = req.user.id;
    const { propertyId, rating, comment } = req.body;

    if (!propertyId || !rating) {
      return res.status(400).json({ success: false, message: "propertyId & rating required" });
    }

    if (!mongoose.Types.ObjectId.isValid(propertyId))
      return res.status(400).json({ success: false, message: "Invalid propertyId" });

    // Check if tenant booked & completed stay
    const hasStayed = await Booking.findOne({
      propertyId,
      tenantId,
      status: "completed"
    });

    if (!hasStayed) {
      return res.status(403).json({
        success: false,
        message: "You can review only after completing a stay"
      });
    }

    // Prevent duplicate review
    const existing = await Review.findOne({ propertyId, userId: tenantId });
    if (existing) {
      return res.status(409).json({ success: false, message: "You already reviewed this property" });
    }

    const review = await Review.create({
      propertyId,
      userId: tenantId,
      rating,
      comment
    });

    res.status(201).json({ success: true, review });
  } catch (err) {
    console.error("addReview err:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/tenant/reviews/:id  (update review)
exports.updateReview = async (req, res) => {
  try {
    const tenantId = req.user.id;
    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });

    if (String(review.userId) !== String(tenantId)) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    review.rating = rating ?? review.rating;
    review.comment = comment ?? review.comment;

    await review.save();

    res.json({ success: true, review });
  } catch (err) {
    console.error("updateReview err:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /api/tenant/reviews/:id
exports.deleteReview = async (req, res) => {
  try {
    const tenantId = req.user.id;
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });

    if (String(review.userId) !== String(tenantId)) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    await review.deleteOne();

    res.json({ success: true, message: "Review deleted" });
  } catch (err) {
    console.error("deleteReview err:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/tenant/reviews/my (My reviews)
exports.getMyReviews = async (req, res) => {
  try {
    const tenantId = req.user.id;

    const reviews = await Review.find({ userId: tenantId })
      .populate("propertyId", "title images")
      .sort("-createdAt");

    res.json({ success: true, reviews });
  } catch (err) {
    console.error("getMyReviews err:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/tenant/reviews/property/:propertyId (Public)
exports.getPropertyReviews = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const reviews = await Review.find({ propertyId })
      .populate("userId", "fullName avatar")
      .sort("-createdAt");

    res.json({ success: true, reviews });
  } catch (err) {
    console.error("getPropertyReviews err:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
