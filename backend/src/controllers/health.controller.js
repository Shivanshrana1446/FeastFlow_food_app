const mongoose = require('mongoose');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Liveness/readiness probe
 *     tags: [Health]
 */
const getHealth = asyncHandler(async (req, res) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  new ApiResponse(200, {
    uptimeSeconds: process.uptime(),
    database: dbStates[mongoose.connection.readyState],
    timestamp: new Date().toISOString(),
  }).send(res);
});

module.exports = { getHealth };
