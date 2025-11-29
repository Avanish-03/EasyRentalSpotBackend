const mongoose = require('mongoose');

const propertyImageSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  imageUrl: { type: String, required: true },
  caption: { type: String },
  isPrimary: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('PropertyImage', propertyImageSchema);
