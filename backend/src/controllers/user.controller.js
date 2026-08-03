const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const userService = require('../services/user.service');

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Get a user profile (self or admin)
 *     tags: [Users]
 *   patch:
 *     summary: Update a user profile (self or admin)
 *     tags: [Users]
 */
const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.user, req.params.id);
  new ApiResponse(200, user, 'User fetched').send(res);
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user, req.params.id, req.body);
  new ApiResponse(200, user, 'Profile updated').send(res);
});

/**
 * @openapi
 * /users/me/addresses:
 *   post:
 *     summary: Add an address to the current user's address book
 *     tags: [Users]
 */
const addAddress = asyncHandler(async (req, res) => {
  const user = await userService.addAddress(req.user._id, req.body);
  new ApiResponse(201, user, 'Address added').send(res);
});

/**
 * @openapi
 * /users/me/addresses/{addressId}:
 *   patch:
 *     summary: Update an address in the current user's address book
 *     tags: [Users]
 *   delete:
 *     summary: Remove an address from the current user's address book
 *     tags: [Users]
 */
const updateAddress = asyncHandler(async (req, res) => {
  const user = await userService.updateAddress(req.user._id, req.params.addressId, req.body);
  new ApiResponse(200, user, 'Address updated').send(res);
});

const removeAddress = asyncHandler(async (req, res) => {
  const user = await userService.removeAddress(req.user._id, req.params.addressId);
  new ApiResponse(200, user, 'Address removed').send(res);
});

module.exports = { getUser, updateUser, addAddress, updateAddress, removeAddress };
