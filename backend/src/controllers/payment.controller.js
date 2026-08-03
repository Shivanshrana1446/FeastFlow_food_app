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

module.exports = { getPayment };
