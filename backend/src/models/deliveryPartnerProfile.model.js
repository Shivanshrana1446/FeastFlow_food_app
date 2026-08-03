const mongoose = require('mongoose');

const deliveryPartnerProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    vehicleType: { type: String, enum: ['bike', 'scooter', 'bicycle', 'car'], required: true },
    vehicleNumber: { type: String, trim: true },
    licenseNumber: { type: String, trim: true },
    isAvailable: { type: Boolean, default: false },
    currentLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    currentOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

deliveryPartnerProfileSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('DeliveryPartnerProfile', deliveryPartnerProfileSchema);
