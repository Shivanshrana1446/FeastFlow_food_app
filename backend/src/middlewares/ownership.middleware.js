const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Restaurant = require('../models/restaurant.model');
const MenuItem = require('../models/menuItem.model');
const { assertOwnerOrAdmin } = require('../services/restaurant.service');

/**
 * Rejects the request before multer writes anything to disk if the caller
 * doesn't own the restaurant. Ownership is re-checked in the service layer
 * too (defense in depth) — this middleware exists specifically so an upload
 * is never accepted onto disk only to be rejected afterwards.
 */
const requireRestaurantOwner = asyncHandler(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id).select('owner');
  if (!restaurant) throw ApiError.notFound('Restaurant not found');
  assertOwnerOrAdmin(req.user, restaurant);
  next();
});

/** Same guarantee for a menu item, whose ownership is resolved via its parent restaurant. */
const requireMenuItemOwner = asyncHandler(async (req, res, next) => {
  const item = await MenuItem.findById(req.params.id).select('restaurant');
  if (!item) throw ApiError.notFound('Menu item not found');
  const restaurant = await Restaurant.findById(item.restaurant).select('owner');
  if (!restaurant) throw ApiError.notFound('Restaurant not found');
  assertOwnerOrAdmin(req.user, restaurant);
  next();
});

module.exports = { requireRestaurantOwner, requireMenuItemOwner };
