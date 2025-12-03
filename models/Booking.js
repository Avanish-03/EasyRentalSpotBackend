const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },

  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // visit or rental booking
  bookingType: {
    type: String,
    enum: ['visit', 'rental'],
    default: 'rental'
  },

  visitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PropertyVisit',
    default: null
  },

  // Only required for rental bookings
  bookingStartDate: { type: Date },
  bookingEndDate: { type: Date },

  // booking request status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },

  cancelReason: { type: String, default: null },

  totalAmount: { type: Number, required: true },

  currency: { type: String, default: 'INR' },

  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'partial', 'refunded'],
    default: 'unpaid'
  },

  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    default: null
  }

}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
