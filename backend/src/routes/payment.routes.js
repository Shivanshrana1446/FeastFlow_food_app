const express = require('express');
const authenticate = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { idParamSchema } = require('../validations/common.validation');
const { verifyRazorpayPaymentSchema } = require('../validations/payment.validation');
const { getPayment, verifyRazorpayPayment } = require('../controllers/payment.controller');

const router = express.Router();

router.use(authenticate);

// Called by the frontend right after Razorpay's checkout widget reports success — see
// services/payment.service.js#verifyRazorpayPayment for why the signature can be trusted.
router.post('/razorpay/verify', validate({ body: verifyRazorpayPaymentSchema }), verifyRazorpayPayment);

// Payments are created automatically at checkout (see POST /orders); this module
// exposes read access to the resulting payment record for tracking/receipts.
router.get('/:id', validate({ params: idParamSchema }), getPayment);

module.exports = router;
