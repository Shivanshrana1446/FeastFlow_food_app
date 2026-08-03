const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const cartService = require('../services/cart.service');

/**
 * @openapi
 * /cart:
 *   get:
 *     summary: Get the current customer's active cart
 *     tags: [Cart]
 *   delete:
 *     summary: Clear the current customer's cart
 *     tags: [Cart]
 */
const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user._id);
  new ApiResponse(200, cart, 'Cart fetched').send(res);
});

/**
 * @openapi
 * /cart/items:
 *   post:
 *     summary: Add an item to the cart (replaces cart if switching restaurants)
 *     tags: [Cart]
 */
const addItem = asyncHandler(async (req, res) => {
  const cart = await cartService.addItem(req.user._id, req.body);
  new ApiResponse(201, cart, 'Item added to cart').send(res);
});

/**
 * @openapi
 * /cart/items/{itemId}:
 *   patch:
 *     summary: Update a cart item's quantity
 *     tags: [Cart]
 *   delete:
 *     summary: Remove an item from the cart
 *     tags: [Cart]
 */
const updateItem = asyncHandler(async (req, res) => {
  const cart = await cartService.updateItemQuantity(req.user._id, req.params.itemId, req.body.quantity);
  new ApiResponse(200, cart, 'Cart item updated').send(res);
});

const removeItem = asyncHandler(async (req, res) => {
  const cart = await cartService.removeItem(req.user._id, req.params.itemId);
  new ApiResponse(200, cart, 'Cart item removed').send(res);
});

const clearCart = asyncHandler(async (req, res) => {
  await cartService.clearCart(req.user._id);
  new ApiResponse(200, null, 'Cart cleared').send(res);
});

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
