const express = require('express');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { ROLES } = require('../constants/roles');
const { idParamSchema } = require('../validations/common.validation');
const {
  createCategorySchema,
  updateCategorySchema,
  listCategoriesQuerySchema,
} = require('../validations/category.validation');
const {
  createCategory,
  listCategories,
  updateCategory,
  deleteCategory,
} = require('../controllers/category.controller');

const router = express.Router();

router.get('/', validate({ query: listCategoriesQuerySchema }), listCategories);

router.post(
  '/',
  authenticate,
  authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  validate({ body: createCategorySchema }),
  createCategory
);

router.patch(
  '/:id',
  authenticate,
  authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  validate({ params: idParamSchema, body: updateCategorySchema }),
  updateCategory
);

router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  validate({ params: idParamSchema }),
  deleteCategory
);

module.exports = router;
