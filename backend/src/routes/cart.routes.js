const express = require('express');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { ROLES } = require('../constants/roles');
const { addItemSchema, updateItemSchema, itemIdParamSchema } = require('../validations/cart.validation');
const { getCart, addItem, updateItem, removeItem, clearCart } = require('../controllers/cart.controller');

const router = express.Router();

router.use(authenticate, authorize(ROLES.CUSTOMER));

router.get('/', getCart);
router.post('/items', validate({ body: addItemSchema }), addItem);
router.patch('/items/:itemId', validate({ params: itemIdParamSchema, body: updateItemSchema }), updateItem);
router.delete('/items/:itemId', validate({ params: itemIdParamSchema }), removeItem);
router.delete('/', clearCart);

module.exports = router;
