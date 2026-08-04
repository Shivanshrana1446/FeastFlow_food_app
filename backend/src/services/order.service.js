const Order = require('../models/order.model');
const Cart = require('../models/cart.model');
const Restaurant = require('../models/restaurant.model');
const ApiError = require('../utils/ApiError');
const paginate = require('../utils/paginate');
const env = require('../config/env');
const logger = require('../config/logger');
const razorpay = require('../config/razorpay');
const { calculateOrderPricing } = require('../utils/orderPricing');
const { assertTransition } = require('../utils/orderStateMachine');
const { ORDER_STATUS, ORDER_STATUS_LABEL, PAYMENT_METHOD } = require('../constants/orderStatus');
const { DEFAULT_DELIVERY_FEE } = require('../constants/pricing');
const { ROLES } = require('../constants/roles');
const { NOTIFICATION_TYPE } = require('../constants/notification');
const paymentService = require('./payment.service');
const notificationService = require('./notification.service');

const shortId = (id) => id.toString().slice(-8);

const ORDER_POPULATE = [
  { path: 'restaurant', select: 'name address logoUrl location' },
  { path: 'user', select: 'name email phone' },
  { path: 'deliveryPartner', select: 'name phone' },
];

async function placeOrder(user, payload) {
  const cart = await Cart.findOne({ user: user._id });
  if (!cart || cart.items.length === 0) {
    throw ApiError.badRequest('Your cart is empty');
  }

  const restaurant = await Restaurant.findById(cart.restaurant);
  if (!restaurant || !restaurant.isApproved) throw ApiError.badRequest('Restaurant is not available');
  if (!restaurant.isOpen) throw ApiError.badRequest('Restaurant is currently closed');

  const pricing = calculateOrderPricing(cart.items, { deliveryFee: DEFAULT_DELIVERY_FEE });
  if (pricing.subtotal < restaurant.minOrderAmount) {
    throw ApiError.badRequest(`Minimum order amount for this restaurant is ${restaurant.minOrderAmount}`);
  }

  // For Razorpay, create the gateway order BEFORE our own Order document — if Razorpay's API
  // fails, nothing gets persisted on our side and the customer just retries. Doing it the other
  // way around would risk a phantom Order with no way to ever pay for it.
  let razorpayOrder = null;
  if (payload.paymentMethod === PAYMENT_METHOD.RAZORPAY) {
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(pricing.total * 100), // Razorpay wants the smallest currency unit (paise)
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`,
      });
    } catch (error) {
      logger.error(`Razorpay order creation failed: ${error.message}`);
      throw ApiError.badRequest('Could not initiate payment. Please try again.');
    }
  }

  const order = await Order.create({
    user: user._id,
    restaurant: restaurant._id,
    items: cart.items.map((i) => ({
      menuItem: i.menuItem,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      addOns: i.addOns,
    })),
    deliveryAddress: payload.deliveryAddress,
    pricing,
    paymentMethod: payload.paymentMethod,
    estimatedDeliveryAt: new Date(Date.now() + (restaurant.avgPreparationTimeMinutes + 30) * 60 * 1000),
  });

  const payment = razorpayOrder
    ? await paymentService.createRazorpayPaymentRecord(order, payload.paymentMethod, razorpayOrder.id)
    : await paymentService.createCodPaymentRecord(order, payload.paymentMethod);
  await cart.deleteOne();

  await notificationService.notify(
    restaurant.owner,
    NOTIFICATION_TYPE.ORDER_PLACED,
    'New order received',
    `Order #${shortId(order._id)} for ₹${pricing.total} just came in.`,
    { orderId: order._id }
  );

  return {
    order,
    payment,
    ...(razorpayOrder && {
      razorpayOrder: { id: razorpayOrder.id, amount: razorpayOrder.amount, currency: razorpayOrder.currency },
      razorpayKeyId: env.RAZORPAY_KEY_ID,
    }),
  };
}

async function listOrders(requester, query) {
  const { page, limit, status, sortBy } = query;
  const filter = {};
  if (status) filter.status = status;

  if (requester.role === ROLES.CUSTOMER) {
    filter.user = requester._id;
  } else if (requester.role === ROLES.RESTAURANT_OWNER) {
    const restaurantIds = await Restaurant.find({ owner: requester._id }).distinct('_id');
    filter.restaurant = { $in: restaurantIds };
  } else if (requester.role === ROLES.DELIVERY_PARTNER) {
    filter.deliveryPartner = requester._id;
  }

  return paginate(Order, { filter, page, limit, sortBy, populate: ORDER_POPULATE });
}

async function assertOrderAccess(requester, order) {
  if (requester.role === ROLES.ADMIN) return;
  if (requester.role === ROLES.CUSTOMER && order.user.toString() === requester._id.toString()) return;
  if (requester.role === ROLES.DELIVERY_PARTNER && order.deliveryPartner?.toString() === requester._id.toString()) {
    return;
  }
  if (requester.role === ROLES.RESTAURANT_OWNER) {
    const restaurant = await Restaurant.findById(order.restaurant);
    if (restaurant && restaurant.owner.toString() === requester._id.toString()) return;
  }
  throw ApiError.forbidden('You do not have access to this order');
}

async function getOrderById(requester, id) {
  const order = await Order.findById(id);
  if (!order) throw ApiError.notFound('Order not found');
  await assertOrderAccess(requester, order); // must run before populate: relies on raw ObjectId refs
  await order.populate(ORDER_POPULATE);

  // Lets the receipt page (and a Razorpay payment retry) load from just an order id — e.g. after
  // a page refresh, when no payment id is available from in-memory navigation state. key_id is
  // not a secret (the checkout widget ships it to the browser either way), so it's fine to
  // include whenever there's an unpaid Razorpay payment to retry.
  const payment = await paymentService.getPaymentByOrderId(order._id);
  return {
    ...order.toObject(),
    payment,
    ...(payment?.gateway === 'razorpay' && { razorpayKeyId: env.RAZORPAY_KEY_ID }),
  };
}

/** Restaurant-owner/admin lifecycle transitions: confirm, prepare, ready, cancel. */
async function updateOrderStatus(requester, id, { status, note, cancellationReason }) {
  const order = await Order.findById(id);
  if (!order) throw ApiError.notFound('Order not found');

  if (requester.role === ROLES.RESTAURANT_OWNER) {
    const restaurant = await Restaurant.findById(order.restaurant);
    if (!restaurant || restaurant.owner.toString() !== requester._id.toString()) {
      throw ApiError.forbidden('You do not own this restaurant');
    }
  }

  assertTransition(requester.role, order.status, status);

  order.status = status;
  order.statusHistory.push({ status, note });
  if (status === ORDER_STATUS.CANCELLED) {
    order.cancelledAt = new Date();
    order.cancellationReason = cancellationReason || note || 'Cancelled';
  }

  await order.save();

  await notificationService.notify(
    order.user,
    NOTIFICATION_TYPE.ORDER_STATUS_CHANGED,
    `Order ${ORDER_STATUS_LABEL[status]}`,
    `Your order #${shortId(order._id)} is now ${ORDER_STATUS_LABEL[status].toLowerCase()}.`,
    { orderId: order._id, status }
  );

  return order;
}

/**
 * Delivery-partner self-assignment: claims an unassigned, ready-for-pickup order.
 *
 * This must be a single atomic update, not a read-then-write: two delivery
 * partners hitting "accept" on the same order within milliseconds of each
 * other would otherwise both pass a `findById` + in-memory check before
 * either `save()`s, and the second save would silently overwrite the first
 * partner's claim (a classic check-then-act race).
 */
async function acceptDelivery(partner, orderId) {
  const order = await Order.findOneAndUpdate(
    { _id: orderId, status: ORDER_STATUS.READY_FOR_PICKUP, deliveryPartner: null },
    {
      $set: { deliveryPartner: partner._id, status: ORDER_STATUS.ASSIGNED },
      $push: { statusHistory: { status: ORDER_STATUS.ASSIGNED, note: `Accepted by ${partner.name}`, changedAt: new Date() } },
    },
    { new: true }
  );

  if (!order) {
    // The atomic claim above failed — figure out why, for a precise error message.
    const existing = await Order.findById(orderId);
    if (!existing) throw ApiError.notFound('Order not found');
    if (existing.deliveryPartner) {
      throw ApiError.conflict('Order has already been claimed by another delivery partner');
    }
    assertTransition(ROLES.DELIVERY_PARTNER, existing.status, ORDER_STATUS.ASSIGNED);
    throw ApiError.conflict('Order is no longer available for pickup');
  }

  await notificationService.notify(
    order.user,
    NOTIFICATION_TYPE.ORDER_ASSIGNED,
    'A rider is on the way',
    `${partner.name} will deliver your order #${shortId(order._id)}.`,
    { orderId: order._id }
  );

  return order;
}

/** Delivery-partner lifecycle transitions after acceptance: pickedUp, outForDelivery, delivered. */
async function transitionAsDeliveryPartner(partner, orderId, nextStatus) {
  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found');
  if (!order.deliveryPartner || order.deliveryPartner.toString() !== partner._id.toString()) {
    throw ApiError.forbidden('You are not the delivery partner assigned to this order');
  }

  assertTransition(ROLES.DELIVERY_PARTNER, order.status, nextStatus);

  order.status = nextStatus;
  order.statusHistory.push({ status: nextStatus });
  if (nextStatus === ORDER_STATUS.DELIVERED) {
    order.deliveredAt = new Date();
    await paymentService.markPaidOnDelivery(order._id);
  }

  await order.save();

  await notificationService.notify(
    order.user,
    nextStatus === ORDER_STATUS.DELIVERED ? NOTIFICATION_TYPE.ORDER_DELIVERED : NOTIFICATION_TYPE.ORDER_STATUS_CHANGED,
    nextStatus === ORDER_STATUS.DELIVERED ? 'Order delivered' : `Order ${ORDER_STATUS_LABEL[nextStatus]}`,
    nextStatus === ORDER_STATUS.DELIVERED
      ? `Order #${shortId(order._id)} was delivered. Enjoy your meal — don't forget to leave a review!`
      : `Your order #${shortId(order._id)} is now ${ORDER_STATUS_LABEL[nextStatus].toLowerCase()}.`,
    { orderId: order._id, status: nextStatus }
  );

  return order;
}

async function listAvailableForPickup(query) {
  const { page, limit, sortBy } = query;
  return paginate(Order, {
    filter: { status: ORDER_STATUS.READY_FOR_PICKUP, deliveryPartner: null },
    page,
    limit,
    sortBy,
    populate: [{ path: 'restaurant', select: 'name address location' }],
  });
}

async function listAssignedActive(partnerId, query) {
  const { page, limit, sortBy } = query;
  return paginate(Order, {
    filter: {
      deliveryPartner: partnerId,
      status: { $in: [ORDER_STATUS.ASSIGNED, ORDER_STATUS.PICKED_UP, ORDER_STATUS.OUT_FOR_DELIVERY] },
    },
    page,
    limit,
    sortBy,
    populate: [
      { path: 'restaurant', select: 'name address location' },
      { path: 'user', select: 'name phone' },
    ],
  });
}

async function listDeliveryHistory(partnerId, query) {
  const { page, limit, sortBy } = query;
  return paginate(Order, {
    filter: { deliveryPartner: partnerId, status: { $in: [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED] } },
    page,
    limit,
    sortBy,
    populate: [{ path: 'restaurant', select: 'name address' }],
  });
}

module.exports = {
  placeOrder,
  listOrders,
  getOrderById,
  updateOrderStatus,
  acceptDelivery,
  transitionAsDeliveryPartner,
  listAvailableForPickup,
  listAssignedActive,
  listDeliveryHistory,
  assertOrderAccess,
};
