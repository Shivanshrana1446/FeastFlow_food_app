const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/user.model');
const { generateAuthTokens, hashToken } = require('../../src/utils/tokens');
const { ROLES } = require('../../src/constants/roles');

let counter = 0;

/** Registers a user via the public API (customer/restaurantOwner/deliveryPartner only). */
async function registerUser(role, overrides = {}) {
  counter += 1;
  const payload = {
    name: overrides.name || `Test User ${counter}`,
    email: overrides.email || `user${counter}@example.com`,
    password: overrides.password || 'SuperSecret123',
    role,
  };
  const res = await request(app).post('/api/v1/auth/register').send(payload);
  if (res.status !== 201) {
    throw new Error(`Failed to register test user: ${JSON.stringify(res.body)}`);
  }
  return { user: res.body.data.user, accessToken: res.body.data.accessToken };
}

/** Admin can't self-register (by design); created directly and issued a token. */
async function createAdmin(overrides = {}) {
  counter += 1;
  const user = await User.create({
    name: overrides.name || `Admin ${counter}`,
    email: overrides.email || `admin${counter}@example.com`,
    password: overrides.password || 'SuperSecret123',
    role: ROLES.ADMIN,
  });
  const { accessToken, refreshToken } = generateAuthTokens(user);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });
  return { user: user.toSafeJSON(), accessToken };
}

const authHeader = (token) => `Bearer ${token}`;

module.exports = { registerUser, createAdmin, authHeader };
