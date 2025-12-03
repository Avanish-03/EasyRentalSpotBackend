const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  title: { type: String, required: true },
  slug: { type: String, unique: true },

  description: { type: String, required: true },
  propertyType: {
    type: String,
    enum: ['apartment', 'house', 'villa', 'studio', 'other'],
    required: true
  },

  // Dashboard filtering + admin approval system
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: { type: String, default: null },

  // Availability status
  status: {
    type: String,
    enum: ['available', 'booked', 'under_maintenance', 'inactive'],
    default: 'available'
  },

  price: { type: Number, required: true },
  currency: { type: String, default: 'INR' },

  amenityIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Amenity' }],
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },

  images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PropertyImage' }],

  bedrooms: { type: Number, required: true },
  bathrooms: { type: Number, required: true },
  area: { type: Number, required: true },
  allowedGuests: { type: Number },

  // For owner dashboard stats
  views: { type: Number, default: 0 }

}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
