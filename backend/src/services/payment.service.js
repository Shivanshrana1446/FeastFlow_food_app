const crypto = require('crypto');
const Payment = require('../models/payment.model');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');
const { PAYMENT_STATUS } = require('../constants/orderStatus');
const { ROLES } = require('../constants/roles');

/** Cash on Delivery never touches a gateway — it settles on delivery instead, see markPaidOnDelivery. */
async function createCodPaymentRecord(order, method) {
  return Payment.create({
    order: order._id,
    user: order.user,
    amount: order.pricing.total,
    method,
    status: PAYMENT_STATUS.PENDING,
    gateway: 'cash',
  });
}

/** Created immediately after the matching Razorpay order, before the customer has actually paid. */
async function createRazorpayPaymentRecord(order, method, razorpayOrderId) {
  return Payment.create({
    order: order._id,
    user: order.user,
    amount: order.pricing.total,
    method,
    status: PAYMENT_STATUS.PENDING,
    gateway: 'razorpay',
    gatewayOrderId: razorpayOrderId,
  });
}

function isValidRazorpaySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(String(razorpaySignature || ''), 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * Confirms a Razorpay checkout completed for real. Trusts nothing from the client except as input
 * to the signature check — `razorpaySignature` is HMAC-SHA256(orderId|paymentId) using the key
 * secret, which only Razorpay and our server ever hold, so a valid signature proves Razorpay
 * actually processed this exact payment for this exact order.
 */
async function verifyRazorpayPayment(requester, { razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  const payment = await Payment.findOne({ gatewayOrderId: razorpayOrderId });
  if (!payment) throw ApiError.notFound('Payment not found for this order');
  if (payment.user.toString() !== requester._id.toString()) {
    throw ApiError.forbidden('You do not have access to this payment');
  }
  if (payment.status === PAYMENT_STATUS.PAID) return payment;

  if (!isValidRazorpaySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature })) {
    throw ApiError.badRequest('Payment verification failed — signature mismatch');
  }

  payment.status = PAYMENT_STATUS.PAID;
  payment.transactionId = razorpayPaymentId;
  await payment.save();
  return payment;
}

/** Marks a COD payment settled once the order is actually delivered. */
async function markPaidOnDelivery(orderId) {
  await Payment.findOneAndUpdate(
    { order: orderId, status: PAYMENT_STATUS.PENDING },
    { status: PAYMENT_STATUS.PAID }
  );
}

async function getPaymentById(requester, id) {
  const payment = await Payment.findById(id).populate('order');
  if (!payment) throw ApiError.notFound('Payment not found');
  if (requester.role !== ROLES.ADMIN && payment.user.toString() !== requester._id.toString()) {
    throw ApiError.forbidden('You do not have access to this payment');
  }
  return payment;
}

/** Used to attach payment info to GET /orders/:id — lets the receipt page load standalone (e.g. on refresh). */
async function getPaymentByOrderId(orderId) {
  return Payment.findOne({ order: orderId }).lean();
}

module.exports = {
  createCodPaymentRecord,
  createRazorpayPaymentRecord,
  verifyRazorpayPayment,
  markPaidOnDelivery,
  getPaymentById,
  getPaymentByOrderId,
};
