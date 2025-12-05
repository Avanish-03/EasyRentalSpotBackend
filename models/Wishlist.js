const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true
    }
  },
  { timestamps: true }
);

// Prevent duplicate entries
wishlistSchema.index({ tenantId: 1, propertyId: 1 }, { unique: true });

module.exports = mongoose.model("Wishlist", wishlistSchema);
