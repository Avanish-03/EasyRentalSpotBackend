const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  planName: { type: String, required: true }, // e.g., Basic / Premium / Pro
  planType: { type: String, enum: ['monthly', 'quarterly', 'yearly'], required: true },

  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },

  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },

  paymentStatus: { type: String, enum: ['pending','paid','failed','cancelled'], default: 'pending' },

  isActive: { type: Boolean, default: true } // auto false after expiry
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
