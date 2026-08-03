const mongoose = require('mongoose');

/**
 * Shared embedded address shape — used verbatim by the user address book and
 * the order's delivery-address snapshot. Factory (not a singleton schema) so
 * each embedding document can set its own _id/timestamps behavior.
 */
function createAddressSchema(schemaOptions = { _id: false }) {
  return new mongoose.Schema(
    {
      line1: { type: String, required: true, trim: true },
      line2: { type: String, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      postalCode: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true, default: 'India' },
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: undefined }, // [lng, lat]
      },
    },
    schemaOptions
  );
}

module.exports = createAddressSchema;
