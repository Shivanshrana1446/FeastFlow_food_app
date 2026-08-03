const { z } = require('zod');
const { objectId } = require('./common.validation');

const createCategorySchema = z.object({
  restaurant: objectId('restaurant'),
  name: z.string().trim().min(1).max(100),
  displayOrder: z.coerce.number().int().default(0),
});

const updateCategorySchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  displayOrder: z.coerce.number().int().optional(),
});

const listCategoriesQuerySchema = z.object({
  restaurant: objectId('restaurant'),
});

module.exports = { createCategorySchema, updateCategorySchema, listCategoriesQuerySchema };
