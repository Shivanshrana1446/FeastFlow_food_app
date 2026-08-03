const NOTIFICATION_TYPE = Object.freeze({
  ORDER_PLACED: 'order_placed',
  ORDER_STATUS_CHANGED: 'order_status_changed',
  ORDER_ASSIGNED: 'order_assigned',
  ORDER_DELIVERED: 'order_delivered',
  REVIEW_RECEIVED: 'review_received',
});

module.exports = {
  NOTIFICATION_TYPE,
  NOTIFICATION_TYPE_VALUES: Object.values(NOTIFICATION_TYPE),
};
