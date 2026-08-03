const { z } = require('zod');
const { objectId } = require('./common.validation');

const addOnSchema = z.object({
  name: z.string().trim().min(1).max(100),
  price: z.coerce.number().min(0).max(100000),
});

const addItemSchema = z.object({
  menuItem: objectId('menuItem'),
  quantity: z.coerce.number().int().positive().max(50).default(1),
  addOns: z.array(addOnSchema).max(20).default([]),
});

const updateItemSchema = z.object({
  quantity: z.coerce.number().int().positive().max(50),
});

const itemIdParamSchema = z.object({
  itemId: objectId('itemId'),
});

module.exports = { addItemSchema, updateItemSchema, itemIdParamSchema };
