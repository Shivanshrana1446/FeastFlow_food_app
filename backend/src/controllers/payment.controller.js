const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const paymentService = require('../services/payment.service');

/**
 * @openapi
 * /payments/{id}:
 *   get:
 *     summary: Get a payment record (order owner or admin)
 *     tags: [Payments]
 */
const getPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.getPaymentById(req.user, req.params.id);
  new ApiResponse(200, payment, 'Payment fetched').send(res);
});

/**
 * @openapi
 * /payments/razorpay/verify:
 *   post:
 *     summary: Verify a completed Razorpay checkout and mark the payment paid
 *     tags: [Payments]
 */
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.verifyRazorpayPayment(req.user, req.body);
  new ApiResponse(200, payment, 'Payment verified').send(res);
});

module.exports = { getPayment, verifyRazorpayPayment };
