const express = require('express');
const authenticate = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { idParamSchema } = require('../validations/common.validation');
const { getPayment } = require('../controllers/payment.controller');

const router = express.Router();

// Payments are created automatically at checkout (see POST /orders); this module
// exposes read access to the resulting payment record for tracking/receipts.
router.get('/:id', authenticate, validate({ params: idParamSchema }), getPayment);

module.exports = router;
