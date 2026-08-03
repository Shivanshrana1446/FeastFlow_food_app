const { z } = require('zod');
const { paginationQuerySchema } = require('./common.validation');

const listQuerySchema = paginationQuerySchema.omit({ q: true, sortBy: true }).extend({
  limit: z.coerce.number().int().positive().max(100).default(20),
});

module.exports = { listQuerySchema };
