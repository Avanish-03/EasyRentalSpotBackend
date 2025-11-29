const Review = require('../models/Review');

// Create Review
exports.createReview = async (req, res) => {
  try {
    const { userId, propertyId, rating, comment } = req.body;

    const review = new Review({
      userId,
      propertyId,
      rating,
      comment
    });

    await review.save();
    res.status(201).json({ message: "Review created successfully", review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all Reviews
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('userId', 'fullName email')
      .populate('propertyId', 'title');
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Review by ID
exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('userId', 'fullName email')
      .populate('propertyId', 'title');
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.status(200).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Review
exports.updateReview = async (req, res) => {
  try {
    const updates = req.body;
    const review = await Review.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!review) return res.status(404).json({ message: "Review not found" });

    res.status(200).json({ message: "Review updated", review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Review
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    res.status(200).json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
