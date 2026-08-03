const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const restaurantService = require('../services/restaurant.service');
const { toPublicUrl } = require('../middlewares/upload.middleware');

/**
 * @openapi
 * /restaurants:
 *   get:
 *     summary: Search restaurants (text search, cuisine/city/isOpen filters, sorting, pagination, geo-radius)
 *     tags: [Restaurants]
 *   post:
 *     summary: Create a restaurant (restaurantOwner/admin)
 *     tags: [Restaurants]
 */
const createRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await restaurantService.createRestaurant(req.user, req.body);
  new ApiResponse(201, restaurant, 'Restaurant created').send(res);
});

const listRestaurants = asyncHandler(async (req, res) => {
  const { results, meta } = await restaurantService.listRestaurants(req.query);
  new ApiResponse(200, results, 'Restaurants fetched', meta).send(res);
});

/**
 * @openapi
 * /restaurants/mine:
 *   get:
 *     summary: List restaurants owned by the current user, including unapproved ones (dashboard use)
 *     tags: [Restaurants]
 */
const listMyRestaurants = asyncHandler(async (req, res) => {
  const restaurants = await restaurantService.listMine(req.user._id);
  new ApiResponse(200, restaurants, 'Your restaurants fetched').send(res);
});

/**
 * @openapi
 * /restaurants/{id}:
 *   get:
 *     summary: Get restaurant details
 *     tags: [Restaurants]
 *   patch:
 *     summary: Update a restaurant (owner/admin)
 *     tags: [Restaurants]
 *   delete:
 *     summary: Delete a restaurant (owner/admin)
 *     tags: [Restaurants]
 */
const getRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await restaurantService.getRestaurantById(req.params.id);
  new ApiResponse(200, restaurant, 'Restaurant fetched').send(res);
});

/**
 * @openapi
 * /restaurants/{id}/menu:
 *   get:
 *     summary: Browse a restaurant's menu grouped by category
 *     tags: [Restaurants]
 */
const getRestaurantMenu = asyncHandler(async (req, res) => {
  const menu = await restaurantService.getRestaurantMenu(req.params.id, {
    includeUnavailable: req.query.includeUnavailable === 'true',
  });
  new ApiResponse(200, menu, 'Menu fetched').send(res);
});

const updateRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await restaurantService.updateRestaurant(req.user, req.params.id, req.body);
  new ApiResponse(200, restaurant, 'Restaurant updated').send(res);
});

const deleteRestaurant = asyncHandler(async (req, res) => {
  await restaurantService.deleteRestaurant(req.user, req.params.id);
  new ApiResponse(200, null, 'Restaurant deleted').send(res);
});

/**
 * @openapi
 * /restaurants/{id}/images:
 *   patch:
 *     summary: Upload restaurant logo/cover image (owner/admin)
 *     tags: [Restaurants]
 */
const uploadImages = asyncHandler(async (req, res) => {
  const images = {};
  if (req.files?.logo?.[0]) images.logoUrl = toPublicUrl('restaurants', req.files.logo[0].filename);
  if (req.files?.cover?.[0]) images.coverImageUrl = toPublicUrl('restaurants', req.files.cover[0].filename);

  const restaurant = await restaurantService.setImages(req.user, req.params.id, images);
  new ApiResponse(200, restaurant, 'Images updated').send(res);
});

/**
 * @openapi
 * /restaurants/{id}/dashboard:
 *   get:
 *     summary: Restaurant owner dashboard statistics (owner/admin)
 *     tags: [Restaurants]
 */
const getDashboard = asyncHandler(async (req, res) => {
  const stats = await restaurantService.getDashboardStats(req.user, req.params.id);
  new ApiResponse(200, stats, 'Dashboard stats fetched').send(res);
});

module.exports = {
  createRestaurant,
  listRestaurants,
  listMyRestaurants,
  getRestaurant,
  getRestaurantMenu,
  updateRestaurant,
  deleteRestaurant,
  uploadImages,
  getDashboard,
};
