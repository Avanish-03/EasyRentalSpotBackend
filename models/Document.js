const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  documentType: { type: String, enum: ['id_proof','property_agreement','other'], required: true },
  documentUrl: { type: String, required: true },
  status: { type: String, enum: ['pending','verified','rejected'], default: 'pending' },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
