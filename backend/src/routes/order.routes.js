const express = require('express');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { ROLES } = require('../constants/roles');
const { idParamSchema } = require('../validations/common.validation');
const {
  placeOrderSchema,
  listOrdersQuerySchema,
  updateOrderStatusSchema,
} = require('../validations/order.validation');
const { placeOrder, listOrders, getOrder, updateOrderStatus } = require('../controllers/order.controller');

const router = express.Router();

router.use(authenticate);

router.post('/', authorize(ROLES.CUSTOMER), validate({ body: placeOrderSchema }), placeOrder);
router.get('/', validate({ query: listOrdersQuerySchema }), listOrders);
router.get('/:id', validate({ params: idParamSchema }), getOrder);

router.patch(
  '/:id/status',
  authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  validate({ params: idParamSchema, body: updateOrderStatusSchema }),
  updateOrderStatus
);

module.exports = router;
