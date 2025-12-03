const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({

  addressLine1: { type: String, required: true },
  addressLine2: { type: String, default: "" },

  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },

  postalCode: { type: String, required: true },

  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null },

  // For search optimization & dashboard statistics
  fullAddress: { type: String }

}, { timestamps: true });


// Auto-generate fullAddress
locationSchema.pre('save', function (next) {
  this.fullAddress = `${this.addressLine1}, ${this.addressLine2 || ""}, ${this.city}, ${this.state}, ${this.country} - ${this.postalCode}`;
  next();
});

module.exports = mongoose.model('Location', locationSchema);
