export const ROLES = {
  CUSTOMER: 'customer',
  RESTAURANT_OWNER: 'restaurantOwner',
  DELIVERY_PARTNER: 'deliveryPartner',
  ADMIN: 'admin',
};

export const ORDER_STATUS = {
  PLACED: 'placed',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY_FOR_PICKUP: 'readyForPickup',
  ASSIGNED: 'assigned',
  PICKED_UP: 'pickedUp',
  OUT_FOR_DELIVERY: 'outForDelivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const ORDER_STATUS_LABEL = {
  placed: 'Placed',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  readyForPickup: 'Ready for pickup',
  assigned: 'Rider assigned',
  pickedUp: 'Picked up',
  outForDelivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

/** { value, label } pairs derived from ORDER_STATUS_LABEL, for <Select> options. */
export const ORDER_STATUS_OPTIONS = Object.entries(ORDER_STATUS_LABEL).map(([value, label]) => ({ value, label }));

/** Tailwind class pairs (bg/text) per status, used by StatusBadge. */
export const ORDER_STATUS_STYLE = {
  placed: 'bg-info-50 text-info-700',
  confirmed: 'bg-info-50 text-info-700',
  preparing: 'bg-warning-50 text-warning-700',
  readyForPickup: 'bg-warning-50 text-warning-700',
  assigned: 'bg-brand-50 text-brand-700',
  pickedUp: 'bg-brand-50 text-brand-700',
  outForDelivery: 'bg-brand-50 text-brand-700',
  delivered: 'bg-success-50 text-success-700',
  cancelled: 'bg-danger-50 text-danger-700',
};

export const TERMINAL_ORDER_STATUSES = [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED];

export const ORDER_STATUS_FLOW = [
  ORDER_STATUS.PLACED,
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.READY_FOR_PICKUP,
  ORDER_STATUS.ASSIGNED,
  ORDER_STATUS.PICKED_UP,
  ORDER_STATUS.OUT_FOR_DELIVERY,
  ORDER_STATUS.DELIVERED,
];

export const PAYMENT_METHOD = {
  CARD: 'card',
  UPI: 'upi',
  CASH_ON_DELIVERY: 'cashOnDelivery',
  WALLET: 'wallet',
};

export const PAYMENT_METHOD_LABEL = {
  card: 'Credit / Debit Card',
  upi: 'UPI',
  cashOnDelivery: 'Cash on Delivery',
  wallet: 'Wallet',
};

export const ROLE_HOME_PATH = {
  [ROLES.CUSTOMER]: '/restaurants',
  [ROLES.RESTAURANT_OWNER]: '/owner/dashboard',
  [ROLES.DELIVERY_PARTNER]: '/delivery/assigned',
  [ROLES.ADMIN]: '/admin/dashboard',
};

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

/** The Express API mounts uploaded files off its own origin, one level above /api/v1. */
export const ASSET_BASE_URL = API_BASE_URL.replace(/\/api\/v\d+\/?$/, '');
