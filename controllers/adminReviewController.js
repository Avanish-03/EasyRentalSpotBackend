const Review = require("../models/Review");
const User = require("../models/User");
const Property = require("../models/Property");

// GET /api/admin/reviews
exports.getAllReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      rating,
      propertyId,
      userId,
      sort = "-createdAt"
    } = req.query;

    const filters = {};

    if (rating) filters.rating = Number(rating);
    if (propertyId) filters.propertyId = propertyId;
    if (userId) filters.userId = userId;

    // Search in comment or username
    if (search) {
      const users = await User.find({
        fullName: { $regex: search, $options: "i" }
      }).select("_id");

      filters.$or = [
        { comment: { $regex: search, $options: "i" }},
        { userId: { $in: users.map(u => u._id) }}
      ];
    }

    const skip = (page - 1) * limit;

    const reviews = await Review.find(filters)
      .populate("userId", "fullName email")
      .populate("propertyId", "title")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments(filters);

    res.json({
      success: true,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      },
      reviews
    });

  } catch (err) {
    console.error("Admin getAllReviews:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// GET /api/admin/reviews/:id
exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate("userId", "fullName email")
      .populate("propertyId", "title");

    if (!review)
      return res.status(404).json({ success: false, message: "Review not found" });

    res.json({ success: true, review });

  } catch (err) {
    console.error("Admin getReviewById:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// DELETE /api/admin/reviews/:id
exports.deleteReview = async (req, res) => {
  try {
    const deleted = await Review.findByIdAndDelete(req.params.id);

    if (!deleted)
      return res.status(404).json({ success: false, message: "Review not found" });

    res.json({ success: true, message: "Review deleted" });

  } catch (err) {
    console.error("Admin deleteReview:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
