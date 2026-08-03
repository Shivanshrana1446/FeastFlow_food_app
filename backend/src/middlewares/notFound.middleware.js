const ApiError = require('../utils/ApiError');

function notFound(req, res, next) {
  next(ApiError.notFound(`Route not found - ${req.originalUrl}`));
}

module.exports = notFound;
