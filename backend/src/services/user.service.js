const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const { ROLES } = require('../constants/roles');

function assertSelfOrAdmin(requester, targetId) {
  if (requester.role !== ROLES.ADMIN && requester._id.toString() !== targetId.toString()) {
    throw ApiError.forbidden('You may only access your own profile');
  }
}

async function getUserById(requester, targetId) {
  assertSelfOrAdmin(requester, targetId);
  const user = await User.findById(targetId);
  if (!user) throw ApiError.notFound('User not found');
  return user.toSafeJSON();
}

async function updateProfile(requester, targetId, updates) {
  assertSelfOrAdmin(requester, targetId);
  const user = await User.findById(targetId);
  if (!user) throw ApiError.notFound('User not found');

  Object.assign(user, updates);
  await user.save();
  return user.toSafeJSON();
}

async function addAddress(userId, address) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  if (address.isDefault) {
    user.addresses.forEach((a) => {
      a.isDefault = false;
    });
  }
  user.addresses.push(address);
  await user.save();
  return user.toSafeJSON();
}

async function updateAddress(userId, addressId, updates) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  const address = user.addresses.id(addressId);
  if (!address) throw ApiError.notFound('Address not found');

  if (updates.isDefault) {
    user.addresses.forEach((a) => {
      a.isDefault = false;
    });
  }
  Object.assign(address, updates);
  await user.save();
  return user.toSafeJSON();
}

async function removeAddress(userId, addressId) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  const address = user.addresses.id(addressId);
  if (!address) throw ApiError.notFound('Address not found');

  address.deleteOne();
  await user.save();
  return user.toSafeJSON();
}

module.exports = { getUserById, updateProfile, addAddress, updateAddress, removeAddress };
