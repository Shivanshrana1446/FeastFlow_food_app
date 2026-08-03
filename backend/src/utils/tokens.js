const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');

// Pinned explicitly rather than relying on the library default, so the
// verify side can never be tricked into accepting a token signed with a
// different algorithm (algorithm-confusion attacks).
const JWT_ALGORITHM = 'HS256';

function signAccessToken(payload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN, algorithm: JWT_ALGORITHM });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN, algorithm: JWT_ALGORITHM });
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: [JWT_ALGORITHM] });
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, { algorithms: [JWT_ALGORITHM] });
}

/** Refresh tokens are stored hashed so a DB leak alone can't be replayed. */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateAuthTokens(user) {
  const payload = { sub: user._id.toString(), role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  return { accessToken, refreshToken };
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  generateAuthTokens,
};
