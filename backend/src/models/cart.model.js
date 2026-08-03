const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true }, // snapshot at add-time
    price: { type: Number, required: true, min: 0 }, // snapshot at add-time
    quantity: { type: Number, required: true, min: 1, default: 1 },
    addOns: {
      type: [{ name: String, price: Number }],
      default: [],
    },
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: true }
);

// One active cart per (user, restaurant) pair.
cartSchema.index({ user: 1, restaurant: 1 }, { unique: true });

module.exports = mongoose.model('Cart', cartSchema);
