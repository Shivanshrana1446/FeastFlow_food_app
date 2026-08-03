const express = require('express');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { ROLES } = require('../constants/roles');
const { idParamSchema } = require('../validations/common.validation');
const {
  listUsersQuerySchema,
  updateUserStatusSchema,
  listRestaurantsQuerySchema,
  approveRestaurantSchema,
  listQuerySchema,
} = require('../validations/admin.validation');
const {
  getDashboard,
  listUsers,
  updateUserStatus,
  listRestaurants,
  setRestaurantApproval,
  listDeliveryPartners,
} = require('../controllers/admin.controller');

const router = express.Router();

router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/dashboard', getDashboard);

router.get('/users', validate({ query: listUsersQuerySchema }), listUsers);
router.patch(
  '/users/:id/status',
  validate({ params: idParamSchema, body: updateUserStatusSchema }),
  updateUserStatus
);

router.get('/restaurants', validate({ query: listRestaurantsQuerySchema }), listRestaurants);
router.patch(
  '/restaurants/:id/approve',
  validate({ params: idParamSchema, body: approveRestaurantSchema }),
  setRestaurantApproval
);

router.get('/delivery-partners', validate({ query: listQuerySchema }), listDeliveryPartners);

module.exports = router;
