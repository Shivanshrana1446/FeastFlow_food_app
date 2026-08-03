const { z } = require('zod');
const { objectId, paginationQuerySchema } = require('./common.validation');

const createReviewSchema = z.object({
  order: objectId('order'),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});

const listReviewsQuerySchema = paginationQuerySchema.omit({ q: true }).extend({
  restaurant: objectId('restaurant'),
});

module.exports = { createReviewSchema, listReviewsQuerySchema };
