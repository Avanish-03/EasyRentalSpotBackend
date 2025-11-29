const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, enum: ['user','property','booking','other'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending','reviewed','resolved','dismissed'], default: 'pending' },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolutionComment: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
