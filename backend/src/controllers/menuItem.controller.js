const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const menuItemService = require('../services/menuItem.service');
const { uploadBufferToCloudinary } = require('../utils/cloudinaryUpload');
const { CLOUDINARY_FOLDERS } = require('../constants/uploadFolders');

/**
 * @openapi
 * /menu-items:
 *   get:
 *     summary: Search/filter menu items across restaurants (name/description search, veg, price range, sorting, pagination)
 *     tags: [MenuItems]
 *   post:
 *     summary: Create a menu item (owner/admin)
 *     tags: [MenuItems]
 */
const createMenuItem = asyncHandler(async (req, res) => {
  const item = await menuItemService.createMenuItem(req.user, req.body);
  new ApiResponse(201, item, 'Menu item created').send(res);
});

const listMenuItems = asyncHandler(async (req, res) => {
  const { results, meta } = await menuItemService.listMenuItems(req.query);
  new ApiResponse(200, results, 'Menu items fetched', meta).send(res);
});

/**
 * @openapi
 * /menu-items/{id}:
 *   get:
 *     summary: Get a menu item
 *     tags: [MenuItems]
 *   patch:
 *     summary: Update a menu item (owner/admin)
 *     tags: [MenuItems]
 *   delete:
 *     summary: Delete a menu item (owner/admin)
 *     tags: [MenuItems]
 */
const getMenuItem = asyncHandler(async (req, res) => {
  const item = await menuItemService.getMenuItemById(req.params.id);
  new ApiResponse(200, item, 'Menu item fetched').send(res);
});

const updateMenuItem = asyncHandler(async (req, res) => {
  const item = await menuItemService.updateMenuItem(req.user, req.params.id, req.body);
  new ApiResponse(200, item, 'Menu item updated').send(res);
});

const deleteMenuItem = asyncHandler(async (req, res) => {
  await menuItemService.deleteMenuItem(req.user, req.params.id);
  new ApiResponse(200, null, 'Menu item deleted').send(res);
});

/**
 * @openapi
 * /menu-items/{id}/image:
 *   patch:
 *     summary: Upload a menu item image (owner/admin)
 *     tags: [MenuItems]
 */
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Image file is required');
  const { url, publicId } = await uploadBufferToCloudinary(req.file.buffer, CLOUDINARY_FOLDERS.MENU_ITEMS);
  const item = await menuItemService.setImage(req.user, req.params.id, { imageUrl: url, imagePublicId: publicId });
  new ApiResponse(200, item, 'Image updated').send(res);
});

module.exports = { createMenuItem, listMenuItems, getMenuItem, updateMenuItem, deleteMenuItem, uploadImage };
