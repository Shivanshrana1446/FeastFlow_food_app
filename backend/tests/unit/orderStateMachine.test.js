const { assertTransition } = require('../../src/utils/orderStateMachine');
const { ORDER_STATUS } = require('../../src/constants/orderStatus');
const { ROLES } = require('../../src/constants/roles');

describe('assertTransition', () => {
  it('allows a restaurantOwner to move an order forward through the prep pipeline', () => {
    expect(() => assertTransition(ROLES.RESTAURANT_OWNER, ORDER_STATUS.PLACED, ORDER_STATUS.CONFIRMED)).not.toThrow();
    expect(() =>
      assertTransition(ROLES.RESTAURANT_OWNER, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING)
    ).not.toThrow();
    expect(() =>
      assertTransition(ROLES.RESTAURANT_OWNER, ORDER_STATUS.PREPARING, ORDER_STATUS.READY_FOR_PICKUP)
    ).not.toThrow();
  });

  it('rejects a restaurantOwner skipping ahead to delivered', () => {
    expect(() => assertTransition(ROLES.RESTAURANT_OWNER, ORDER_STATUS.PLACED, ORDER_STATUS.DELIVERED)).toThrow();
  });

  it('rejects a customer attempting any transition', () => {
    expect(() => assertTransition(ROLES.CUSTOMER, ORDER_STATUS.PLACED, ORDER_STATUS.CONFIRMED)).toThrow();
  });

  it('walks a deliveryPartner through assigned -> pickedUp -> outForDelivery -> delivered', () => {
    expect(() =>
      assertTransition(ROLES.DELIVERY_PARTNER, ORDER_STATUS.READY_FOR_PICKUP, ORDER_STATUS.ASSIGNED)
    ).not.toThrow();
    expect(() => assertTransition(ROLES.DELIVERY_PARTNER, ORDER_STATUS.ASSIGNED, ORDER_STATUS.PICKED_UP)).not.toThrow();
    expect(() =>
      assertTransition(ROLES.DELIVERY_PARTNER, ORDER_STATUS.PICKED_UP, ORDER_STATUS.OUT_FOR_DELIVERY)
    ).not.toThrow();
    expect(() =>
      assertTransition(ROLES.DELIVERY_PARTNER, ORDER_STATUS.OUT_FOR_DELIVERY, ORDER_STATUS.DELIVERED)
    ).not.toThrow();
  });

  it('rejects a deliveryPartner trying to claim an order that is not yet readyForPickup', () => {
    expect(() => assertTransition(ROLES.DELIVERY_PARTNER, ORDER_STATUS.PREPARING, ORDER_STATUS.ASSIGNED)).toThrow();
  });

  it('lets admin bypass the table for any non-terminal transition', () => {
    expect(() => assertTransition(ROLES.ADMIN, ORDER_STATUS.PLACED, ORDER_STATUS.DELIVERED)).not.toThrow();
    expect(() => assertTransition(ROLES.ADMIN, ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELLED)).not.toThrow();
  });

  it('blocks every role, including admin, from touching a terminal order', () => {
    expect(() => assertTransition(ROLES.ADMIN, ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED)).toThrow();
    expect(() =>
      assertTransition(ROLES.RESTAURANT_OWNER, ORDER_STATUS.CANCELLED, ORDER_STATUS.CONFIRMED)
    ).toThrow();
  });
});
