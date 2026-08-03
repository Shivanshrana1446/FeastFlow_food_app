const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const deliveryService = require('../services/delivery.service');
const orderService = require('../services/order.service');
const { ORDER_STATUS } = require('../constants/orderStatus');

/**
 * @openapi
 * /delivery/profile:
 *   get:
 *     summary: Get the delivery partner's own profile
 *     tags: [Delivery]
 *   patch:
 *     summary: Update vehicle/profile details
 *     tags: [Delivery]
 */
const getProfile = asyncHandler(async (req, res) => {
  const profile = await deliveryService.getProfile(req.user._id);
  new ApiResponse(200, profile, 'Profile fetched').send(res);
});

const updateProfile = asyncHandler(async (req, res) => {
  const profile = await deliveryService.updateProfile(req.user._id, req.body);
  new ApiResponse(200, profile, 'Profile updated').send(res);
});

/**
 * @openapi
 * /delivery/availability:
 *   patch:
 *     summary: Toggle availability to receive new deliveries
 *     tags: [Delivery]
 */
const setAvailability = asyncHandler(async (req, res) => {
  const profile = await deliveryService.setAvailability(req.user._id, req.body.isAvailable);
  new ApiResponse(200, profile, 'Availability updated').send(res);
});

/**
 * @openapi
 * /delivery/location:
 *   patch:
 *     summary: Update the delivery partner's live location
 *     tags: [Delivery]
 */
const setLocation = asyncHandler(async (req, res) => {
  const profile = await deliveryService.setLocation(req.user._id, req.body.coordinates);
  new ApiResponse(200, profile, 'Location updated').send(res);
});

/**
 * @openapi
 * /delivery/orders/available:
 *   get:
 *     summary: List unassigned orders ready for pickup
 *     tags: [Delivery]
 */
const listAvailableOrders = asyncHandler(async (req, res) => {
  const { results, meta } = await orderService.listAvailableForPickup(req.query);
  new ApiResponse(200, results, 'Available orders fetched', meta).send(res);
});

/**
 * @openapi
 * /delivery/orders/assigned:
 *   get:
 *     summary: List orders currently assigned to this delivery partner
 *     tags: [Delivery]
 */
const listAssignedOrders = asyncHandler(async (req, res) => {
  const { results, meta } = await orderService.listAssignedActive(req.user._id, req.query);
  new ApiResponse(200, results, 'Assigned orders fetched', meta).send(res);
});

/**
 * @openapi
 * /delivery/orders/history:
 *   get:
 *     summary: List this delivery partner's completed/cancelled deliveries
 *     tags: [Delivery]
 */
const listHistory = asyncHandler(async (req, res) => {
  const { results, meta } = await orderService.listDeliveryHistory(req.user._id, req.query);
  new ApiResponse(200, results, 'Delivery history fetched', meta).send(res);
});

/**
 * @openapi
 * /delivery/orders/{id}/accept:
 *   patch:
 *     summary: Accept (self-assign) a ready-for-pickup order
 *     tags: [Delivery]
 */
const acceptOrder = asyncHandler(async (req, res) => {
  const order = await orderService.acceptDelivery(req.user, req.params.id);
  new ApiResponse(200, order, 'Order accepted').send(res);
});

/**
 * @openapi
 * /delivery/orders/{id}/picked-up:
 *   patch:
 *     summary: Mark an assigned order as picked up from the restaurant
 *     tags: [Delivery]
 * /delivery/orders/{id}/out-for-delivery:
 *   patch:
 *     summary: Mark a picked-up order as out for delivery
 *     tags: [Delivery]
 * /delivery/orders/{id}/delivered:
 *   patch:
 *     summary: Mark an order as delivered (also settles a pending Cash on Delivery payment)
 *     tags: [Delivery]
 */
const pickedUp = asyncHandler(async (req, res) => {
  const order = await orderService.transitionAsDeliveryPartner(req.user, req.params.id, ORDER_STATUS.PICKED_UP);
  new ApiResponse(200, order, 'Order marked as picked up').send(res);
});

const outForDelivery = asyncHandler(async (req, res) => {
  const order = await orderService.transitionAsDeliveryPartner(
    req.user,
    req.params.id,
    ORDER_STATUS.OUT_FOR_DELIVERY
  );
  new ApiResponse(200, order, 'Order marked as out for delivery').send(res);
});

const delivered = asyncHandler(async (req, res) => {
  const order = await orderService.transitionAsDeliveryPartner(req.user, req.params.id, ORDER_STATUS.DELIVERED);
  new ApiResponse(200, order, 'Order marked as delivered').send(res);
});

module.exports = {
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
};
