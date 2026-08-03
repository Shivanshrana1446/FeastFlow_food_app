const { PAYMENT_METHOD } = require('../constants/orderStatus');

const DECLINE_REASONS = [
  'Card declined by issuing bank',
  'Insufficient balance',
  'Payment authorization timed out',
  "Bank's server did not respond",
];

/** Simulated decline rate for gateway-routed methods (not Cash on Delivery). */
const FAILURE_RATE = 0.08;

/**
 * Stands in for a real payment gateway (Razorpay/Stripe/etc). Cash on Delivery
 * never touches a gateway at all — it settles on delivery instead, see
 * payment.service.js#markPaidOnDelivery. Every other method has a small
 * simulated chance of a realistic decline so the checkout flow has to handle
 * failure, not just the happy path.
 */
function chargeMock(method) {
  if (method === PAYMENT_METHOD.CASH_ON_DELIVERY) {
    return { success: true, status: 'pending' };
  }

  if (Math.random() < FAILURE_RATE) {
    const failureReason = DECLINE_REASONS[Math.floor(Math.random() * DECLINE_REASONS.length)];
    return { success: false, status: 'failed', failureReason };
  }

  return {
    success: true,
    status: 'paid',
    transactionId: `SIM-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
  };
}

module.exports = { chargeMock, FAILURE_RATE };
