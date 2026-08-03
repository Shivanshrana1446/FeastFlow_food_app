const Payment = require('../models/payment.model');
const ApiError = require('../utils/ApiError');
const { PAYMENT_METHOD, PAYMENT_STATUS } = require('../constants/orderStatus');
const { ROLES } = require('../constants/roles');

/** Persists the outcome of a (successful) mock gateway charge — see utils/mockPaymentGateway.js. */
async function createPaymentRecord(order, chargeResult, method) {
  const isCOD = method === PAYMENT_METHOD.CASH_ON_DELIVERY;
  return Payment.create({
    order: order._id,
    user: order.user,
    amount: order.pricing.total,
    method,
    status: chargeResult.status,
    gateway: isCOD ? 'cash' : 'simulated',
    transactionId: chargeResult.transactionId,
  });
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

module.exports = { createPaymentRecord, markPaidOnDelivery, getPaymentById };
