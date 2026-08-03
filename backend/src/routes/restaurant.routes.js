const express = require('express');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { ROLES } = require('../constants/roles');
const { idParamSchema } = require('../validations/common.validation');
const {
  createRestaurantSchema,
  updateRestaurantSchema,
  listRestaurantsQuerySchema,
} = require('../validations/restaurant.validation');
const { makeUploader } = require('../middlewares/upload.middleware');
const { requireRestaurantOwner } = require('../middlewares/ownership.middleware');
const {
  createRestaurant,
  listRestaurants,
  listMyRestaurants,
  getRestaurant,
  getRestaurantMenu,
  updateRestaurant,
  deleteRestaurant,
  uploadImages,
  getDashboard,
} = require('../controllers/restaurant.controller');

const router = express.Router();
const uploadRestaurantImages = makeUploader('restaurants');

router.get('/', validate({ query: listRestaurantsQuerySchema }), listRestaurants);

// Must be registered before /:id so "mine" isn't parsed as an ObjectId param.
router.get('/mine', authenticate, authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN), listMyRestaurants);

router.get('/:id', validate({ params: idParamSchema }), getRestaurant);
router.get('/:id/menu', validate({ params: idParamSchema }), getRestaurantMenu);

router.post(
  '/',
  authenticate,
  authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  validate({ body: createRestaurantSchema }),
  createRestaurant
);

router.get(
  '/:id/dashboard',
  authenticate,
  authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  validate({ params: idParamSchema }),
  getDashboard
);

router.patch(
  '/:id/images',
  authenticate,
  authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  validate({ params: idParamSchema }),
  requireRestaurantOwner,
  uploadRestaurantImages.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
  ]),
  uploadImages
);

router.patch(
  '/:id',
  authenticate,
  authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  validate({ params: idParamSchema, body: updateRestaurantSchema }),
  updateRestaurant
);

router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  validate({ params: idParamSchema }),
  deleteRestaurant
);

module.exports = router;
