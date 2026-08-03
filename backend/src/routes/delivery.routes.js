const express = require('express');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { ROLES } = require('../constants/roles');
const { idParamSchema } = require('../validations/common.validation');
const {
  upsertProfileSchema,
  availabilitySchema,
  locationSchema,
  listQuerySchema,
} = require('../validations/delivery.validation');
const {
  getProfile,
  updateProfile,
  setAvailability,
  setLocation,
  listAvailableOrders,
  listAssignedOrders,
  listHistory,
  acceptOrder,
  pickedUp,
  outForDelivery,
  delivered,
} = require('../controllers/delivery.controller');

const router = express.Router();

router.use(authenticate, authorize(ROLES.DELIVERY_PARTNER));

router.get('/profile', getProfile);
router.patch('/profile', validate({ body: upsertProfileSchema }), updateProfile);
router.patch('/availability', validate({ body: availabilitySchema }), setAvailability);
router.patch('/location', validate({ body: locationSchema }), setLocation);

router.get('/orders/available', validate({ query: listQuerySchema }), listAvailableOrders);
router.get('/orders/assigned', validate({ query: listQuerySchema }), listAssignedOrders);
router.get('/orders/history', validate({ query: listQuerySchema }), listHistory);

router.patch('/orders/:id/accept', validate({ params: idParamSchema }), acceptOrder);
router.patch('/orders/:id/picked-up', validate({ params: idParamSchema }), pickedUp);
router.patch('/orders/:id/out-for-delivery', validate({ params: idParamSchema }), outForDelivery);
router.patch('/orders/:id/delivered', validate({ params: idParamSchema }), delivered);

module.exports = router;
