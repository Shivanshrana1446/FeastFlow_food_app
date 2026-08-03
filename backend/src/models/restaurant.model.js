const mongoose = require('mongoose');

const openingHourSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
      required: true,
    },
    open: { type: String, required: true }, // "09:00"
    close: { type: String, required: true }, // "22:00"
  },
  { _id: false }
);

const restaurantSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, trim: true, maxlength: 1000 },
    cuisine: { type: [String], default: [] },
    logoUrl: { type: String },
    coverImageUrl: { type: String },
    address: {
      line1: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      postalCode: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true, default: 'India' },
    },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    openingHours: { type: [openingHourSchema], default: [] },
    isOpen: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false }, // admin approval before going live
    minOrderAmount: { type: Number, default: 0 },
    avgPreparationTimeMinutes: { type: Number, default: 30 },
    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

restaurantSchema.index({ location: '2dsphere' });
restaurantSchema.index({ name: 'text', cuisine: 'text' });
// Covers the public listing's default filter (isApproved) + sort (createdAt), the most common query shape.
restaurantSchema.index({ isApproved: 1, createdAt: -1 });

module.exports = mongoose.model('Restaurant', restaurantSchema);
