const { chargeMock, FAILURE_RATE } = require('../../src/utils/mockPaymentGateway');
const { PAYMENT_METHOD } = require('../../src/constants/orderStatus');

describe('chargeMock', () => {
  it('always succeeds as pending for Cash on Delivery, regardless of randomness', () => {
    const originalRandom = Math.random;
    Math.random = () => 0; // would be a decline for gateway methods
    try {
      const result = chargeMock(PAYMENT_METHOD.CASH_ON_DELIVERY);
      expect(result).toEqual({ success: true, status: 'pending' });
    } finally {
      Math.random = originalRandom;
    }
  });

  it('returns a paid result with a transaction id when the simulated roll succeeds', () => {
    const originalRandom = Math.random;
    Math.random = () => FAILURE_RATE + 0.01; // just above the decline threshold
    try {
      const result = chargeMock(PAYMENT_METHOD.CARD);
      expect(result.success).toBe(true);
      expect(result.status).toBe('paid');
      expect(result.transactionId).toEqual(expect.stringContaining('SIM-'));
    } finally {
      Math.random = originalRandom;
    }
  });

  it('returns a failed result with a reason when the simulated roll declines', () => {
    const originalRandom = Math.random;
    Math.random = () => 0; // below the decline threshold
    try {
      const result = chargeMock(PAYMENT_METHOD.UPI);
      expect(result.success).toBe(false);
      expect(result.status).toBe('failed');
      expect(typeof result.failureReason).toBe('string');
      expect(result.failureReason.length).toBeGreaterThan(0);
    } finally {
      Math.random = originalRandom;
    }
  });
});
