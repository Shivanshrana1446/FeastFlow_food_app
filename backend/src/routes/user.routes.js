const express = require('express');
const authenticate = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { idParamSchema } = require('../validations/common.validation');
const {
  updateProfileSchema,
  addressSchema,
  addressIdParamSchema,
} = require('../validations/user.validation');
const {
  getUser,
  updateUser,
  addAddress,
  updateAddress,
  removeAddress,
} = require('../controllers/user.controller');

const router = express.Router();

router.use(authenticate);

router.post('/me/addresses', validate({ body: addressSchema }), addAddress);
router.patch(
  '/me/addresses/:addressId',
  validate({ params: addressIdParamSchema, body: addressSchema.partial() }),
  updateAddress
);
router.delete('/me/addresses/:addressId', validate({ params: addressIdParamSchema }), removeAddress);

router.get('/:id', validate({ params: idParamSchema }), getUser);
router.patch('/:id', validate({ params: idParamSchema, body: updateProfileSchema }), updateUser);

module.exports = router;
