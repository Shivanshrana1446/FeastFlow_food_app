const ROLES = Object.freeze({
  CUSTOMER: 'customer',
  RESTAURANT_OWNER: 'restaurantOwner',
  DELIVERY_PARTNER: 'deliveryPartner',
  ADMIN: 'admin',
});

const ROLE_VALUES = Object.values(ROLES);

module.exports = { ROLES, ROLE_VALUES };
