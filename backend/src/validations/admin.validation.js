const { z } = require('zod');
const { ROLE_VALUES } = require('../constants/roles');
const { booleanQueryParam, paginationQuerySchema } = require('./common.validation');

const listUsersQuerySchema = paginationQuerySchema.extend({
  role: z.enum(ROLE_VALUES).optional(),
});

const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

const listRestaurantsQuerySchema = paginationQuerySchema.extend({
  isApproved: booleanQueryParam(),
});

const approveRestaurantSchema = z.object({
  isApproved: z.boolean(),
});

const listQuerySchema = paginationQuerySchema.omit({ q: true });

module.exports = {
  listUsersQuerySchema,
  updateUserStatusSchema,
  listRestaurantsQuerySchema,
  approveRestaurantSchema,
  listQuerySchema,
};
