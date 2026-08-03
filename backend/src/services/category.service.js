const Category = require('../models/category.model');
const MenuItem = require('../models/menuItem.model');
const Restaurant = require('../models/restaurant.model');
const ApiError = require('../utils/ApiError');
const { assertOwnerOrAdmin } = require('./restaurant.service');

async function assertRestaurantOwnership(requester, restaurantId) {
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw ApiError.notFound('Restaurant not found');
  assertOwnerOrAdmin(requester, restaurant);
  return restaurant;
}

async function createCategory(requester, data) {
  await assertRestaurantOwnership(requester, data.restaurant);

  const existing = await Category.findOne({ restaurant: data.restaurant, name: data.name });
  if (existing) throw ApiError.conflict('A category with this name already exists for this restaurant');

  return Category.create(data);
}

async function listCategories(restaurantId) {
  return Category.find({ restaurant: restaurantId }).sort({ displayOrder: 1, name: 1 }).lean();
}

async function updateCategory(requester, categoryId, updates) {
  const category = await Category.findById(categoryId);
  if (!category) throw ApiError.notFound('Category not found');
  await assertRestaurantOwnership(requester, category.restaurant);

  Object.assign(category, updates);
  await category.save();
  return category;
}

async function deleteCategory(requester, categoryId) {
  const category = await Category.findById(categoryId);
  if (!category) throw ApiError.notFound('Category not found');
  await assertRestaurantOwnership(requester, category.restaurant);

  const itemCount = await MenuItem.countDocuments({ category: categoryId });
  if (itemCount > 0) {
    throw ApiError.conflict('Cannot delete a category that still has menu items');
  }

  await category.deleteOne();
}

module.exports = { createCategory, listCategories, updateCategory, deleteCategory, assertRestaurantOwnership };
