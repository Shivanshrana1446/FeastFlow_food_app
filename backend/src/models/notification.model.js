const mongoose = require('mongoose');
const { NOTIFICATION_TYPE_VALUES } = require('../constants/notification');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: NOTIFICATION_TYPE_VALUES, required: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    message: { type: String, trim: true, maxlength: 500 },
    // Structured deep-link data (e.g. { orderId }) — deliberately untyped since it
    // varies per notification type and is only ever read back by the frontend.
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
