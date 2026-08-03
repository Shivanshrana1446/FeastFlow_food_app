const Restaurant = require('../models/restaurant.model');
const Category = require('../models/category.model');
const MenuItem = require('../models/menuItem.model');
const Order = require('../models/order.model');
const ApiError = require('../utils/ApiError');
const paginate = require('../utils/paginate');
const { destroyCloudinaryAsset } = require('../utils/cloudinaryUpload');
const { ROLES } = require('../constants/roles');
const { ORDER_STATUS } = require('../constants/orderStatus');

function assertOwnerOrAdmin(requester, restaurant) {
  const isOwner = restaurant.owner.toString() === requester._id.toString();
  if (!isOwner && requester.role !== ROLES.ADMIN) {
    throw ApiError.forbidden('You do not own this restaurant');
  }
}

async function createRestaurant(owner, data) {
  return Restaurant.create({ ...data, owner: owner._id });
}

/**
 * Restaurants owned by the caller, regardless of approval status (dashboard use, not public
 * browsing). Intentionally unpaginated — an owner realistically manages a handful of restaurants,
 * not a public-scale list — but still `.lean()` since the result is serialized straight to JSON.
 */
async function listMine(ownerId) {
  return Restaurant.find({ owner: ownerId }).sort({ createdAt: -1 }).lean();
}

async function listRestaurants(query) {
  const { page, limit, q, cuisine, city, isOpen, sortBy, lat, lng, radiusKm } = query;

  const filter = { isApproved: true };
  if (cuisine) filter.cuisine = cuisine;
  if (city) filter['address.city'] = new RegExp(city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  if (typeof isOpen === 'boolean') filter.isOpen = isOpen;

  if (lat !== undefined && lng !== undefined) {
    filter.location = {
      $nearSphere: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: (radiusKm || 5) * 1000,
      },
    };
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    // countDocuments() runs $nearSphere through an aggregation pipeline internally, and MongoDB
    // rejects $near/$nearSphere there ("not allowed in this context") — it's a find()-only
    // operator. Radius search is inherently bounded (max 50km, validated in the query schema),
    // so fetching every match and paginating in memory is simple and correct here.
    const allResults = await Restaurant.find(filter).lean();
    const totalItems = allResults.length;
    const results = allResults.slice((safePage - 1) * safeLimit, (safePage - 1) * safeLimit + safeLimit);
    return {
      results,
      meta: { page: safePage, limit: safeLimit, totalItems, totalPages: Math.max(1, Math.ceil(totalItems / safeLimit)) },
    };
  }

  return paginate(Restaurant, {
    filter,
    searchTerm: q,
    searchFields: ['name', 'cuisine'],
    page,
    limit,
    sortBy,
  });
}

async function getRestaurantById(id) {
  const restaurant = await Restaurant.findById(id).populate('owner', 'name email phone');
  if (!restaurant) throw ApiError.notFound('Restaurant not found');
  return restaurant;
}

async function getRestaurantMenu(id, { includeUnavailable = false } = {}) {
  const restaurant = await getRestaurantById(id);
  const categories = await Category.find({ restaurant: id }).sort({ displayOrder: 1, name: 1 }).lean();

  const itemFilter = { restaurant: id };
  if (!includeUnavailable) itemFilter.isAvailable = true;
  const items = await MenuItem.find(itemFilter).sort({ name: 1 }).lean();

  const itemsByCategory = items.reduce((acc, item) => {
    const key = item.category.toString();
    (acc[key] = acc[key] || []).push(item);
    return acc;
  }, {});

  return {
    restaurant,
    categories: categories.map((c) => ({ ...c, items: itemsByCategory[c._id.toString()] || [] })),
  };
}

async function updateRestaurant(requester, id, updates) {
  const restaurant = await Restaurant.findById(id);
  if (!restaurant) throw ApiError.notFound('Restaurant not found');
  assertOwnerOrAdmin(requester, restaurant);

  Object.assign(restaurant, updates);
  await restaurant.save();
  return restaurant;
}

async function deleteRestaurant(requester, id) {
  const restaurant = await Restaurant.findById(id);
  if (!restaurant) throw ApiError.notFound('Restaurant not found');
  assertOwnerOrAdmin(requester, restaurant);

  await Promise.all([
    Category.deleteMany({ restaurant: id }),
    MenuItem.deleteMany({ restaurant: id }),
    restaurant.deleteOne(),
  ]);
}

async function setImages(requester, id, images) {
  const restaurant = await Restaurant.findById(id);
  if (!restaurant) throw ApiError.notFound('Restaurant not found');
  assertOwnerOrAdmin(requester, restaurant);

  const staleAssetIds = [];
  if (images.logoUrl) {
    if (restaurant.logoPublicId) staleAssetIds.push(restaurant.logoPublicId);
    restaurant.logoUrl = images.logoUrl;
    restaurant.logoPublicId = images.logoPublicId;
  }
  if (images.coverImageUrl) {
    if (restaurant.coverImagePublicId) staleAssetIds.push(restaurant.coverImagePublicId);
    restaurant.coverImageUrl = images.coverImageUrl;
    restaurant.coverImagePublicId = images.coverImagePublicId;
  }
  await restaurant.save();
  // Delete old Cloudinary assets only after the new ones are safely persisted — never risk
  // orphaning a restaurant with no image because a mid-request failure deleted the old one first.
  await Promise.all(staleAssetIds.map(destroyCloudinaryAsset));
  return restaurant;
}

async function getDashboardStats(requester, id) {
  const restaurant = await Restaurant.findById(id);
  if (!restaurant) throw ApiError.notFound('Restaurant not found');
  assertOwnerOrAdmin(requester, restaurant);

  const [statusCounts, revenueAgg, topItems] = await Promise.all([
    Order.aggregate([
      { $match: { restaurant: restaurant._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { restaurant: restaurant._id, status: ORDER_STATUS.DELIVERED } },
      { $group: { _id: null, revenue: { $sum: '$pricing.total' }, orders: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { restaurant: restaurant._id, status: ORDER_STATUS.DELIVERED } },
      { $unwind: '$items' },
      { $group: { _id: '$items.name', quantitySold: { $sum: '$items.quantity' } } },
      { $sort: { quantitySold: -1 } },
      { $limit: 5 },
    ]),
  ]);

  return {
    ordersByStatus: statusCounts.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
    totalRevenue: revenueAgg[0]?.revenue || 0,
    totalDeliveredOrders: revenueAgg[0]?.orders || 0,
    ratingAvg: restaurant.ratingAvg,
    ratingCount: restaurant.ratingCount,
    topSellingItems: topItems.map((t) => ({ name: t._id, quantitySold: t.quantitySold })),
  };
}

module.exports = {
  assertOwnerOrAdmin,
  createRestaurant,
  listMine,
  listRestaurants,
  getRestaurantById,
  getRestaurantMenu,
  updateRestaurant,
  deleteRestaurant,
  setImages,
  getDashboardStats,
};
