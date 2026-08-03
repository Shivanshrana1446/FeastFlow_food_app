const { TAX_RATE, DEFAULT_DELIVERY_FEE } = require('../constants/pricing');

const round2 = (n) => Math.round(n * 100) / 100;

/**
 * Pure pricing calculator so it can be unit tested without touching the DB.
 * @param {Array<{price: number, quantity: number, addOns?: Array<{price:number}>}>} items
 * @param {object} [options]
 * @param {number} [options.deliveryFee]
 * @param {number} [options.discount]
 */
function calculateOrderPricing(items, options = {}) {
  const { deliveryFee = DEFAULT_DELIVERY_FEE, discount = 0 } = options;

  const subtotal = items.reduce((sum, item) => {
    const addOnsTotal = (item.addOns || []).reduce((s, a) => s + a.price, 0);
    return sum + (item.price + addOnsTotal) * item.quantity;
  }, 0);

  const tax = round2(subtotal * TAX_RATE);
  const safeDiscount = Math.min(discount, subtotal);
  const total = round2(subtotal + tax + deliveryFee - safeDiscount);

  return {
    subtotal: round2(subtotal),
    tax,
    deliveryFee: round2(deliveryFee),
    discount: round2(safeDiscount),
    total,
  };
}

module.exports = { calculateOrderPricing };
