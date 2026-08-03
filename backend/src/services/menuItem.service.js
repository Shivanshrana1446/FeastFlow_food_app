const MenuItem = require('../models/menuItem.model');
const Category = require('../models/category.model');
const Restaurant = require('../models/restaurant.model');
const ApiError = require('../utils/ApiError');
const paginate = require('../utils/paginate');
const { assertRestaurantOwnership } = require('./category.service');

async function createMenuItem(requester, data) {
  await assertRestaurantOwnership(requester, data.restaurant);

  const category = await Category.findById(data.category);
  if (!category || category.restaurant.toString() !== data.restaurant) {
    throw ApiError.badRequest('Category does not belong to this restaurant');
  }

  return MenuItem.create(data);
}

async function listMenuItems(query) {
  const { page, limit, q, restaurant, category, isVeg, isAvailable, minPrice, maxPrice, sortBy } = query;

  const filter = {};
  if (restaurant) {
    // A specific restaurant was requested (owner management, or a menu already
    // reached via its own restaurant page) — no need to re-check approval.
    filter.restaurant = restaurant;
  } else {
    // Cross-restaurant search must not leak dishes from restaurants an admin
    // hasn't approved yet, mirroring the public restaurant listing's own gate.
    const approvedRestaurantIds = await Restaurant.find({ isApproved: true }).distinct('_id');
    filter.restaurant = { $in: approvedRestaurantIds };
  }
  if (category) filter.category = category;
  if (typeof isVeg === 'boolean') filter.isVeg = isVeg;
  if (typeof isAvailable === 'boolean') filter.isAvailable = isAvailable;
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  return paginate(MenuItem, {
    filter,
    searchTerm: q,
    searchFields: ['name', 'description'],
    page,
    limit,
    sortBy,
    // Cross-restaurant search results need to show which restaurant each dish belongs to.
    populate: [{ path: 'restaurant', select: 'name address.city isOpen isApproved' }],
  });
}

async function getMenuItemById(id) {
  const item = await MenuItem.findById(id);
  if (!item) throw ApiError.notFound('Menu item not found');
  return item;
}

async function updateMenuItem(requester, id, updates) {
  const item = await MenuItem.findById(id);
  if (!item) throw ApiError.notFound('Menu item not found');
  await assertRestaurantOwnership(requester, item.restaurant);

  if (updates.category) {
    const category = await Category.findById(updates.category);
    if (!category || category.restaurant.toString() !== item.restaurant.toString()) {
      throw ApiError.badRequest('Category does not belong to this restaurant');
    }
  }

  Object.assign(item, updates);
  await item.save();
  return item;
}

async function deleteMenuItem(requester, id) {
  const item = await MenuItem.findById(id);
  if (!item) throw ApiError.notFound('Menu item not found');
  await assertRestaurantOwnership(requester, item.restaurant);
  await item.deleteOne();
}

async function setImage(requester, id, imageUrl) {
  const item = await MenuItem.findById(id);
  if (!item) throw ApiError.notFound('Menu item not found');
  await assertRestaurantOwnership(requester, item.restaurant);

  item.imageUrl = imageUrl;
  await item.save();
  return item;
}

module.exports = { createMenuItem, listMenuItems, getMenuItemById, updateMenuItem, deleteMenuItem, setImage };
