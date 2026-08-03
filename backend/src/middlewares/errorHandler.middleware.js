const { ZodError } = require('zod');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');
const logger = require('../config/logger');

/**
 * Normalizes any thrown error (Mongoose, JWT, Zod, or our own ApiError) into
 * one consistent { success, message, errors, stack? } envelope. Must be the
 * last middleware registered.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let error = err;

  if (!(error instanceof ApiError)) {
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Something went wrong';
    let errors = [];

    if (error instanceof ZodError) {
      statusCode = 400;
      message = 'Validation failed';
      errors = error.errors.map((e) => ({ path: e.path.join('.'), message: e.message }));
    } else if (error.name === 'CastError') {
      statusCode = 400;
      message = `Invalid value for field '${error.path}'`;
    } else if (error.name === 'ValidationError' && error.errors) {
      statusCode = 400;
      message = 'Validation failed';
      errors = Object.values(error.errors).map((e) => ({ path: e.path, message: e.message }));
    } else if (error.code === 11000) {
      statusCode = 409;
      const field = Object.keys(error.keyValue || {})[0];
      message = field ? `${field} already exists` : 'Duplicate field value';
    } else if (error.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid token';
    } else if (error.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Token expired';
    }

    error = new ApiError(statusCode, message, errors, error.stack);
  }

  if (error.statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} - ${error.message}\n${error.stack}`);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} - ${error.statusCode} - ${error.message}`);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    errors: error.errors && error.errors.length > 0 ? error.errors : undefined,
    stack: env.isDevelopment ? error.stack : undefined,
  });
}

module.exports = errorHandler;
