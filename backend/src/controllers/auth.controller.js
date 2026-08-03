const crypto = require('crypto');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { generateAuthTokens, hashToken, verifyRefreshToken } = require('../utils/tokens');
const { ROLES } = require('../constants/roles');
const env = require('../config/env');

function isValidBootstrapSecret(provided) {
  const configured = env.ADMIN_BOOTSTRAP_SECRET;
  if (!configured) return false;
  const a = Buffer.from(String(provided || ''), 'utf8');
  const b = Buffer.from(configured, 'utf8');
  // timingSafeEqual throws on mismatched lengths, so short-circuit that case first
  // (still fine timing-wise: length alone leaks nothing about the secret's content).
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

const REFRESH_COOKIE_NAME = 'refreshToken';

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/v1/auth',
};

async function issueTokensAndRespond(res, user, statusCode, message) {
  const { accessToken, refreshToken } = generateAuthTokens(user);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);

  return new ApiResponse(statusCode, { user: user.toSafeJSON(), accessToken }, message).send(res);
}

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user (customer, restaurantOwner, or deliveryPartner)
 *     tags: [Auth]
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('Email is already registered');

  const user = await User.create({ name, email, password, phone, role });
  await issueTokensAndRespond(res, user, 201, 'Registration successful');
});

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Log in with email and password
 *     tags: [Auth]
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  if (!user.isActive) {
    throw ApiError.forbidden('This account has been deactivated');
  }

  await issueTokensAndRespond(res, user, 200, 'Login successful');
});

/**
 * @openapi
 * /auth/refresh-token:
 *   post:
 *     summary: Rotate the refresh token and issue a new access token
 *     tags: [Auth]
 */
const refreshTokenHandler = asyncHandler(async (req, res) => {
  const incoming = req.cookies?.[REFRESH_COOKIE_NAME] || req.body.refreshToken;
  if (!incoming) throw ApiError.unauthorized('Refresh token missing');

  let decoded;
  try {
    decoded = verifyRefreshToken(incoming);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.sub).select('+refreshTokenHash');
  if (!user || user.refreshTokenHash !== hashToken(incoming)) {
    throw ApiError.unauthorized('Refresh token has been revoked');
  }

  await issueTokensAndRespond(res, user, 200, 'Token refreshed');
});

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Invalidate the current refresh token
 *     tags: [Auth]
 */
const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $unset: { refreshTokenHash: 1 } });
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/v1/auth' });
  new ApiResponse(200, null, 'Logged out successfully').send(res);
});

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get the current authenticated user's profile
 *     tags: [Auth]
 */
const getMe = asyncHandler(async (req, res) => {
  new ApiResponse(200, req.user.toSafeJSON(), 'Current user fetched').send(res);
});

/**
 * @openapi
 * /auth/bootstrap-admin:
 *   post:
 *     summary: Create the first admin account, or promote an existing account to admin (secret-gated)
 *     description: >
 *       Disabled unless ADMIN_BOOTSTRAP_SECRET is set on the server. Exists so an admin account
 *       can be created on platforms without shell access (e.g. a Render web service) without
 *       exposing admin as a public self-registration role.
 *     tags: [Auth]
 */
const bootstrapAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, secret } = req.body;

  if (!isValidBootstrapSecret(secret)) {
    throw ApiError.forbidden('Invalid bootstrap secret');
  }

  let user = await User.findOne({ email });
  if (user) {
    if (user.role !== ROLES.ADMIN) {
      user.role = ROLES.ADMIN;
      await user.save();
    }
  } else {
    user = await User.create({ name, email, password, role: ROLES.ADMIN, isEmailVerified: true });
  }

  await issueTokensAndRespond(res, user, 200, 'Admin account ready');
});

module.exports = { register, login, refreshTokenHandler, logout, getMe, bootstrapAdmin };
