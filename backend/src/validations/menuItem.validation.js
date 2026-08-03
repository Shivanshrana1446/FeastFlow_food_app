const { z } = require('zod');
const { objectId, booleanQueryParam, paginationQuerySchema } = require('./common.validation');

const addOnSchema = z.object({
  name: z.string().trim().min(1).max(100),
  price: z.coerce.number().min(0).max(100000),
});

const createMenuItemSchema = z.object({
  restaurant: objectId('restaurant'),
  category: objectId('category'),
  name: z.string().trim().min(1).max(150),
  description: z.string().trim().max(1000).optional(),
  price: z.coerce.number().min(0).max(100000),
  isVeg: z.boolean().default(true),
  isAvailable: z.boolean().default(true),
  addOns: z.array(addOnSchema).max(20).default([]),
});

const updateMenuItemSchema = z.object({
  category: objectId('category').optional(),
  name: z.string().trim().min(1).max(150).optional(),
  description: z.string().trim().max(1000).optional(),
  price: z.coerce.number().min(0).max(100000).optional(),
  isVeg: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  addOns: z.array(addOnSchema).max(20).optional(),
});

const listMenuItemsQuerySchema = paginationQuerySchema.extend({
  restaurant: objectId('restaurant').optional(),
  category: objectId('category').optional(),
  isVeg: booleanQueryParam(),
  isAvailable: booleanQueryParam(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
});

module.exports = { createMenuItemSchema, updateMenuItemSchema, listMenuItemsQuerySchema };
