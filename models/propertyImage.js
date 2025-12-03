const mongoose = require('mongoose');

const propertyImageSchema = new mongoose.Schema({

  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },

  imageUrl: {
    type: String,
    required: true
  },

  caption: { type: String, default: "" },

  isPrimary: { type: Boolean, default: false },

  // For sorting images on property page
  order: { type: Number, default: 0 }

}, { timestamps: true });

module.exports = mongoose.model('PropertyImage', propertyImageSchema);
