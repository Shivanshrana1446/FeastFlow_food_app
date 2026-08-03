const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const reviewService = require('../services/review.service');

/**
 * @openapi
 * /reviews:
 *   get:
 *     summary: List reviews for a restaurant
 *     tags: [Reviews]
 *   post:
 *     summary: Review a delivered order (customer)
 *     tags: [Reviews]
 */
const createReview = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(req.user, req.body);
  new ApiResponse(201, review, 'Review submitted').send(res);
});

const listReviews = asyncHandler(async (req, res) => {
  const { results, meta } = await reviewService.listReviews(req.query);
  new ApiResponse(200, results, 'Reviews fetched', meta).send(res);
});

module.exports = { createReview, listReviews };
