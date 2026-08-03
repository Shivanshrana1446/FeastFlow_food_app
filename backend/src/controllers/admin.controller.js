const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const adminService = require('../services/admin.service');

/**
 * @openapi
 * /admin/dashboard:
 *   get:
 *     summary: Platform-wide analytics (users by role, restaurant approvals, orders by status, revenue)
 *     tags: [Admin]
 */
const getDashboard = asyncHandler(async (req, res) => {
  const stats = await adminService.getDashboardAnalytics();
  new ApiResponse(200, stats, 'Dashboard analytics fetched').send(res);
});

/**
 * @openapi
 * /admin/users:
 *   get:
 *     summary: List all users (search by name/email, filter by role, paginate/sort)
 *     tags: [Admin]
 */
const listUsers = asyncHandler(async (req, res) => {
  const { results, meta } = await adminService.listUsers(req.query);
  new ApiResponse(200, results, 'Users fetched', meta).send(res);
});

/**
 * @openapi
 * /admin/users/{id}/status:
 *   patch:
 *     summary: Activate or deactivate a user (customer, restaurantOwner, or deliveryPartner)
 *     tags: [Admin]
 */
const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await adminService.setUserActive(req.params.id, req.body.isActive);
  new ApiResponse(200, user, 'User status updated').send(res);
});

/**
 * @openapi
 * /admin/restaurants:
 *   get:
 *     summary: List all restaurants including unapproved ones
 *     tags: [Admin]
 */
const listRestaurants = asyncHandler(async (req, res) => {
  const { results, meta } = await adminService.listRestaurants(req.query);
  new ApiResponse(200, results, 'Restaurants fetched', meta).send(res);
});

/**
 * @openapi
 * /admin/restaurants/{id}/approve:
 *   patch:
 *     summary: Approve or revoke approval for a restaurant to go live
 *     tags: [Admin]
 */
const setRestaurantApproval = asyncHandler(async (req, res) => {
  const restaurant = await adminService.setRestaurantApproval(req.params.id, req.body.isApproved);
  new ApiResponse(200, restaurant, 'Restaurant approval updated').send(res);
});

/**
 * @openapi
 * /admin/delivery-partners:
 *   get:
 *     summary: List all delivery partner profiles
 *     tags: [Admin]
 */
const listDeliveryPartners = asyncHandler(async (req, res) => {
  const { results, meta } = await adminService.listDeliveryPartners(req.query);
  new ApiResponse(200, results, 'Delivery partners fetched', meta).send(res);
});

module.exports = {
  getDashboard,
  listUsers,
  updateUserStatus,
  listRestaurants,
  setRestaurantApproval,
  listDeliveryPartners,
};
