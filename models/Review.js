const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({

  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },

  comment: {
    type: String,
    default: ""
  },

  // Owner dashboard insights (optional but useful)
  isEdited: { type: Boolean, default: false }

}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
