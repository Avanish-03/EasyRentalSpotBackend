const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({

  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },

  payerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  amount: { type: Number, required: true },

  currency: { type: String, default: 'INR' },

  paymentMethod: {
    type: String,
    enum: ['card', 'netbanking', 'UPI', 'wallet', 'cash'],
    required: true
  },

  status: {
    type: String,
    enum: ['success', 'failed', 'pending', 'refunded'],
    default: 'pending'
  },

  transactionId: { type: String, unique: true, sparse: true },

  // Required for dashboard revenue calculations
  paymentDate: { type: Date, default: Date.now }

}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
