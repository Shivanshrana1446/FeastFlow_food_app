const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const orderService = require('../services/order.service');

/**
 * @openapi
 * /orders:
 *   post:
 *     summary: Place an order from the customer's active cart (checkout)
 *     tags: [Orders]
 *   get:
 *     summary: List orders scoped to the caller's role (customer/restaurantOwner/deliveryPartner see their own; admin sees all)
 *     tags: [Orders]
 */
const placeOrder = asyncHandler(async (req, res) => {
  const { order, payment } = await orderService.placeOrder(req.user, req.body);
  new ApiResponse(201, { order, payment }, 'Order placed successfully').send(res);
});

const listOrders = asyncHandler(async (req, res) => {
  const { results, meta } = await orderService.listOrders(req.user, req.query);
  new ApiResponse(200, results, 'Orders fetched', meta).send(res);
});

/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     summary: Get order details and status history (for tracking)
 *     tags: [Orders]
 */
const getOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.user, req.params.id);
  new ApiResponse(200, order, 'Order fetched').send(res);
});

/**
 * @openapi
 * /orders/{id}/status:
 *   patch:
 *     summary: Update order status (restaurantOwner confirms/prepares/marks ready/cancels; admin can force any transition)
 *     tags: [Orders]
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatus(req.user, req.params.id, req.body);
  new ApiResponse(200, order, 'Order status updated').send(res);
});

module.exports = { placeOrder, listOrders, getOrder, updateOrderStatus };
