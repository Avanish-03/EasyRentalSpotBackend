const mongoose = require('mongoose');

const adminActionSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  actionType: { type: String, enum: ['user_ban','property_approval','booking_cancellation','system_update','other'], required: true },
  targetType: { type: String, enum: ['user','property','booking','system','other'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('AdminAction', adminActionSchema);
