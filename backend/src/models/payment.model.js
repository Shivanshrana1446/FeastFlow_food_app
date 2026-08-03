const mongoose = require('mongoose');
const { PAYMENT_STATUS_VALUES, PAYMENT_STATUS, PAYMENT_METHOD_VALUES } = require('../constants/orderStatus');

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, enum: PAYMENT_METHOD_VALUES, required: true },
    status: { type: String, enum: PAYMENT_STATUS_VALUES, default: PAYMENT_STATUS.PENDING, index: true },
    gateway: { type: String, default: 'manual' }, // e.g. "razorpay", "stripe"
    transactionId: { type: String },
    failureReason: { type: String },
    refundedAmount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
