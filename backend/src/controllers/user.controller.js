const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const userService = require('../services/user.service');
const { uploadBufferToCloudinary } = require('../utils/cloudinaryUpload');
const { CLOUDINARY_FOLDERS } = require('../constants/uploadFolders');

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

/**
 * @openapi
 * /users/me/avatar:
 *   patch:
 *     summary: Upload/replace the current user's profile picture
 *     tags: [Users]
 */
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Image file is required');
  const { url, publicId } = await uploadBufferToCloudinary(req.file.buffer, CLOUDINARY_FOLDERS.AVATARS);
  const user = await userService.setAvatar(req.user._id, { avatarUrl: url, avatarPublicId: publicId });
  new ApiResponse(200, user, 'Avatar updated').send(res);
});

module.exports = { getUser, updateUser, addAddress, updateAddress, removeAddress, uploadAvatar };
