const mongoose = require('mongoose');

const amenitySchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  icon: {
    type: String,
    default: ""
  },

  description: {
    type: String,
    default: ""
  },

  // For sorting amenities in UI
  order: { type: Number, default: 0 }

}, { timestamps: true });

module.exports = mongoose.model('Amenity', amenitySchema);
