const DeliveryPartnerProfile = require('../models/deliveryPartnerProfile.model');

async function getProfile(userId) {
  let profile = await DeliveryPartnerProfile.findOne({ user: userId });
  if (!profile) {
    profile = await DeliveryPartnerProfile.create({ user: userId, vehicleType: 'bike' });
  }
  return profile;
}

async function updateProfile(userId, updates) {
  const profile = await getProfile(userId);
  Object.assign(profile, updates);
  await profile.save();
  return profile;
}

async function setAvailability(userId, isAvailable) {
  const profile = await getProfile(userId);
  profile.isAvailable = isAvailable;
  await profile.save();
  return profile;
}

async function setLocation(userId, coordinates) {
  const profile = await getProfile(userId);
  profile.currentLocation = { type: 'Point', coordinates };
  await profile.save();
  return profile;
}

module.exports = { getProfile, updateProfile, setAvailability, setLocation };
