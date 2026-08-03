const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { generateAuthTokens, hashToken, verifyRefreshToken } = require('../utils/tokens');
const env = require('../config/env');

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

module.exports = { register, login, refreshTokenHandler, logout, getMe };
