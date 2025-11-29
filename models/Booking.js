const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookingStartDate: { type: Date, required: true },
  bookingEndDate: { type: Date, required: true },
  status: { type: String, enum: ['pending','confirmed','cancelled','completed'], default: 'pending' },
  totalAmount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  paymentStatus: { type: String, enum: ['unpaid','paid','partial','refunded'], default: 'unpaid' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
