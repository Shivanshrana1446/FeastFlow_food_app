const express = require('express');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { ROLES } = require('../constants/roles');
const { idParamSchema } = require('../validations/common.validation');
const {
  createMenuItemSchema,
  updateMenuItemSchema,
  listMenuItemsQuerySchema,
} = require('../validations/menuItem.validation');
const { makeUploader } = require('../middlewares/upload.middleware');
const { requireMenuItemOwner } = require('../middlewares/ownership.middleware');
const {
  createMenuItem,
  listMenuItems,
  getMenuItem,
  updateMenuItem,
  deleteMenuItem,
  uploadImage,
} = require('../controllers/menuItem.controller');

const router = express.Router();
const uploadMenuItemImage = makeUploader('menu-items');

router.get('/', validate({ query: listMenuItemsQuerySchema }), listMenuItems);
router.get('/:id', validate({ params: idParamSchema }), getMenuItem);

router.post(
  '/',
  authenticate,
  authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  validate({ body: createMenuItemSchema }),
  createMenuItem
);

router.patch(
  '/:id/image',
  authenticate,
  authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  validate({ params: idParamSchema }),
  requireMenuItemOwner,
  uploadMenuItemImage.single('image'),
  uploadImage
);

router.patch(
  '/:id',
  authenticate,
  authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  validate({ params: idParamSchema, body: updateMenuItemSchema }),
  updateMenuItem
);

router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  validate({ params: idParamSchema }),
  deleteMenuItem
);

module.exports = router;
