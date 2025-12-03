const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  type: {
    type: String,
    enum: ['booking', 'payment', 'message', 'system', 'promotion'],
    required: true
  },

  title: { type: String, required: true },

  message: { type: String, required: true },

  isRead: { type: Boolean, default: false },

  metadata: { type: Object, default: {} },

  // Dashboard analytics ke liye
  readAt: { type: Date, default: null }

}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
