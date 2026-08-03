const ApiError = require('../utils/ApiError');

/**
 * RBAC guard. Must run after `authenticate`. Usage: authorize('admin', 'restaurantOwner')
 */
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized('Authentication required'));
  }
  if (!allowedRoles.includes(req.user.role)) {
    return next(ApiError.forbidden('You do not have permission to perform this action'));
  }
  return next();
};

module.exports = authorize;
