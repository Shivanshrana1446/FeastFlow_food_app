const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const categoryService = require('../services/category.service');

/**
 * @openapi
 * /categories:
 *   get:
 *     summary: List categories for a restaurant
 *     tags: [Categories]
 *   post:
 *     summary: Create a menu category (owner/admin)
 *     tags: [Categories]
 */
const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.user, req.body);
  new ApiResponse(201, category, 'Category created').send(res);
});

const listCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.listCategories(req.query.restaurant);
  new ApiResponse(200, categories, 'Categories fetched').send(res);
});

/**
 * @openapi
 * /categories/{id}:
 *   patch:
 *     summary: Update a menu category (owner/admin)
 *     tags: [Categories]
 *   delete:
 *     summary: Delete a menu category — fails if it still has menu items (owner/admin)
 *     tags: [Categories]
 */
const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.user, req.params.id, req.body);
  new ApiResponse(200, category, 'Category updated').send(res);
});

const deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.user, req.params.id);
  new ApiResponse(200, null, 'Category deleted').send(res);
});

module.exports = { createCategory, listCategories, updateCategory, deleteCategory };
