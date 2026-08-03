const { ORDER_STATUS, TERMINAL_ORDER_STATUSES } = require('../constants/orderStatus');
const { ROLES } = require('../constants/roles');
const ApiError = require('./ApiError');

const { PLACED, CONFIRMED, PREPARING, READY_FOR_PICKUP, ASSIGNED, PICKED_UP, OUT_FOR_DELIVERY, DELIVERED, CANCELLED } =
  ORDER_STATUS;

/**
 * Allowed forward transitions per role. Admin bypasses this table entirely
 * (see assertTransition) but is still blocked from touching terminal orders.
 */
const TRANSITIONS = {
  [ROLES.RESTAURANT_OWNER]: {
    [PLACED]: [CONFIRMED, CANCELLED],
    [CONFIRMED]: [PREPARING, CANCELLED],
    [PREPARING]: [READY_FOR_PICKUP, CANCELLED],
  },
  [ROLES.DELIVERY_PARTNER]: {
    [READY_FOR_PICKUP]: [ASSIGNED],
    [ASSIGNED]: [PICKED_UP],
    [PICKED_UP]: [OUT_FOR_DELIVERY],
    [OUT_FOR_DELIVERY]: [DELIVERED],
  },
};

/**
 * Throws if `role` may not move an order from `currentStatus` to `nextStatus`.
 * Admins may perform any non-terminal-origin transition (including cancellation
 * at any stage); everyone else must follow the TRANSITIONS table above.
 */
function assertTransition(role, currentStatus, nextStatus) {
  if (TERMINAL_ORDER_STATUSES.includes(currentStatus)) {
    throw ApiError.badRequest(`Order is already ${currentStatus} and cannot be changed further`);
  }

  if (role === ROLES.ADMIN) {
    return;
  }

  const allowed = TRANSITIONS[role]?.[currentStatus] || [];
  if (!allowed.includes(nextStatus)) {
    throw ApiError.badRequest(`Cannot move order from '${currentStatus}' to '${nextStatus}' as ${role}`);
  }
}

module.exports = { assertTransition };
