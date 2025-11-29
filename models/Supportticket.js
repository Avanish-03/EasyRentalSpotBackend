const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['open','in_progress','resolved','closed'], default: 'open' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  priority: { type: String, enum: ['low','medium','high','urgent'], default: 'medium' },
  attachments: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
