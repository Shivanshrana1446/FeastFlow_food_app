const User = require('../models/user.model');
const Restaurant = require('../models/restaurant.model');
const DeliveryPartnerProfile = require('../models/deliveryPartnerProfile.model');
const Order = require('../models/order.model');
const ApiError = require('../utils/ApiError');
const paginate = require('../utils/paginate');
const { ORDER_STATUS } = require('../constants/orderStatus');

async function listUsers(query) {
  const { page, limit, q, role, sortBy } = query;
  const filter = {};
  if (role) filter.role = role;
  return paginate(User, { filter, searchTerm: q, searchFields: ['name', 'email'], page, limit, sortBy });
}

async function setUserActive(id, isActive) {
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound('User not found');
  user.isActive = isActive;
  await user.save();
  return user.toSafeJSON();
}

async function listRestaurants(query) {
  const { page, limit, q, isApproved, sortBy } = query;
  const filter = {};
  if (typeof isApproved === 'boolean') filter.isApproved = isApproved;
  return paginate(Restaurant, { filter, searchTerm: q, searchFields: ['name'], page, limit, sortBy });
}

async function setRestaurantApproval(id, isApproved) {
  const restaurant = await Restaurant.findById(id);
  if (!restaurant) throw ApiError.notFound('Restaurant not found');
  restaurant.isApproved = isApproved;
  await restaurant.save();
  return restaurant;
}

async function listDeliveryPartners(query) {
  const { page, limit, sortBy } = query;
  return paginate(DeliveryPartnerProfile, {
    filter: {},
    page,
    limit,
    sortBy,
    populate: [{ path: 'user', select: 'name email phone isActive' }],
  });
}

async function getDashboardAnalytics() {
  const [usersByRole, restaurantApproval, ordersByStatus, revenueAgg] = await Promise.all([
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    Restaurant.aggregate([{ $group: { _id: '$isApproved', count: { $sum: 1 } } }]),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Order.aggregate([
      { $match: { status: ORDER_STATUS.DELIVERED } },
      { $group: { _id: null, revenue: { $sum: '$pricing.total' }, orders: { $sum: 1 } } },
    ]),
  ]);

  return {
    usersByRole: usersByRole.reduce((acc, u) => ({ ...acc, [u._id]: u.count }), {}),
    restaurants: {
      approved: restaurantApproval.find((r) => r._id === true)?.count || 0,
      pendingApproval: restaurantApproval.find((r) => r._id === false)?.count || 0,
    },
    ordersByStatus: ordersByStatus.reduce((acc, o) => ({ ...acc, [o._id]: o.count }), {}),
    totalRevenue: revenueAgg[0]?.revenue || 0,
    totalDeliveredOrders: revenueAgg[0]?.orders || 0,
  };
}

module.exports = {
  listUsers,
  setUserActive,
  listRestaurants,
  setRestaurantApproval,
  listDeliveryPartners,
  getDashboardAnalytics,
};
