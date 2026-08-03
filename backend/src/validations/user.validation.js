const { z } = require('zod');
const { objectId } = require('./common.validation');

const addressIdParamSchema = z.object({
  addressId: objectId('addressId'),
});

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().max(20).optional(),
  avatarUrl: z.string().trim().url().max(500).optional(),
});

const addressSchema = z.object({
  label: z.string().trim().max(50).optional(),
  line1: z.string().trim().min(1).max(200),
  line2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(1).max(100),
  postalCode: z.string().trim().min(1).max(20),
  country: z.string().trim().min(1).max(100).default('India'),
  isDefault: z.boolean().optional(),
  location: z
    .object({
      coordinates: z.tuple([z.number(), z.number()]),
    })
    .optional(),
});

module.exports = { updateProfileSchema, addressSchema, addressIdParamSchema };
