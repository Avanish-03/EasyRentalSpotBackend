const mongoose = require('mongoose');

const propertyVisitSchema = new mongoose.Schema({

  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },

  visitorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  visitDate: { type: Date, required: true },

  visitTime: { type: String, default: null },

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },

  notes: { type: String, default: "" },

  // For analytics: visit completed → booking conversion
  convertedToBooking: {
    type: Boolean,
    default: false
  },

  // Auto-reminder tracking
  reminderSent: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

module.exports = mongoose.model('PropertyVisit', propertyVisitSchema);
