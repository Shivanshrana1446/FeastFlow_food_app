const ORDER_STATUS = Object.freeze({
  PLACED: 'placed',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY_FOR_PICKUP: 'readyForPickup',
  ASSIGNED: 'assigned',
  PICKED_UP: 'pickedUp',
  OUT_FOR_DELIVERY: 'outForDelivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
});

const TERMINAL_ORDER_STATUSES = ['delivered', 'cancelled'];

const ORDER_STATUS_LABEL = Object.freeze({
  placed: 'Placed',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  readyForPickup: 'Ready for pickup',
  assigned: 'Rider assigned',
  pickedUp: 'Picked up',
  outForDelivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
});

const PAYMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
});

// Card/UPI/wallet/netbanking are no longer distinct methods on our side — Razorpay's own
// checkout widget lets the customer pick among those itself, so we only need to know whether
// this order pays online (through Razorpay) or on delivery (cash, settled later).
const PAYMENT_METHOD = Object.freeze({
  RAZORPAY: 'razorpay',
  CASH_ON_DELIVERY: 'cashOnDelivery',
});

module.exports = {
  ORDER_STATUS,
  ORDER_STATUS_VALUES: Object.values(ORDER_STATUS),
  ORDER_STATUS_LABEL,
  TERMINAL_ORDER_STATUSES,
  PAYMENT_STATUS,
  PAYMENT_STATUS_VALUES: Object.values(PAYMENT_STATUS),
  PAYMENT_METHOD,
  PAYMENT_METHOD_VALUES: Object.values(PAYMENT_METHOD),
};
