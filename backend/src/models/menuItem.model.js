const mongoose = require('mongoose');

const addOnSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const menuItemSchema = new mongoose.Schema(
  {
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, trim: true, maxlength: 1000 },
    imageUrl: { type: String },
    imagePublicId: { type: String }, // Cloudinary asset id, for deleting the old image on replace
    price: { type: Number, required: true, min: 0 },
    isVeg: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: true },
    addOns: { type: [addOnSchema], default: [] },
    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

menuItemSchema.index({ restaurant: 1, isAvailable: 1 });
menuItemSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('MenuItem', menuItemSchema);
