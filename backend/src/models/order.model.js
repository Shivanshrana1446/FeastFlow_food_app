const mongoose = require('mongoose');
const { ORDER_STATUS_VALUES, ORDER_STATUS, PAYMENT_METHOD_VALUES } = require('../constants/orderStatus');
const createAddressSchema = require('./shared/address.schema');

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true }, // snapshotted - historically accurate even if menu changes
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    addOns: {
      type: [{ name: String, price: Number }],
      default: [],
    },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, enum: ORDER_STATUS_VALUES, required: true },
    changedAt: { type: Date, default: Date.now },
    note: { type: String },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    items: { type: [orderItemSchema], required: true, validate: (v) => v.length > 0 },
    deliveryAddress: createAddressSchema({ _id: false }),
    pricing: {
      subtotal: { type: Number, required: true, min: 0 },
      tax: { type: Number, required: true, min: 0, default: 0 },
      deliveryFee: { type: Number, required: true, min: 0, default: 0 },
      discount: { type: Number, required: true, min: 0, default: 0 },
      total: { type: Number, required: true, min: 0 },
    },
    paymentMethod: { type: String, enum: PAYMENT_METHOD_VALUES, required: true },
    status: { type: String, enum: ORDER_STATUS_VALUES, default: ORDER_STATUS.PLACED, index: true },
    statusHistory: {
      type: [statusHistorySchema],
      default: () => [{ status: ORDER_STATUS.PLACED }],
    },
    estimatedDeliveryAt: { type: Date },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
    cancellationReason: { type: String },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ restaurant: 1, status: 1, createdAt: -1 });
orderSchema.index({ deliveryPartner: 1, status: 1, createdAt: -1 });
// Available-for-pickup lookups filter on status with no assignee — keep that scan narrow.
orderSchema.index({ status: 1, deliveryPartner: 1 });

module.exports = mongoose.model('Order', orderSchema);
