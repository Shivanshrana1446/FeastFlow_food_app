const { calculateOrderPricing } = require('../../src/utils/orderPricing');

describe('calculateOrderPricing', () => {
  it('sums item price * quantity plus add-ons into subtotal', () => {
    const pricing = calculateOrderPricing(
      [
        { price: 100, quantity: 2, addOns: [{ price: 10 }] },
        { price: 50, quantity: 1, addOns: [] },
      ],
      { deliveryFee: 40 }
    );

    // (100 + 10) * 2 + 50 * 1 = 270
    expect(pricing.subtotal).toBe(270);
    expect(pricing.tax).toBe(13.5); // 5% of 270
    expect(pricing.deliveryFee).toBe(40);
    expect(pricing.discount).toBe(0);
    expect(pricing.total).toBe(270 + 13.5 + 40);
  });

  it('caps discount at the subtotal so total never goes negative', () => {
    const pricing = calculateOrderPricing([{ price: 10, quantity: 1, addOns: [] }], {
      deliveryFee: 0,
      discount: 1000,
    });

    expect(pricing.discount).toBe(10);
    expect(pricing.total).toBeGreaterThanOrEqual(0);
  });

  it('treats missing addOns as an empty list', () => {
    const pricing = calculateOrderPricing([{ price: 20, quantity: 3 }], { deliveryFee: 0 });
    expect(pricing.subtotal).toBe(60);
  });
});
