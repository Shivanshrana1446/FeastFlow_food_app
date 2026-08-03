const { z } = require('zod');
const { paginationQuerySchema } = require('./common.validation');

const upsertProfileSchema = z.object({
  vehicleType: z.enum(['bike', 'scooter', 'bicycle', 'car']),
  vehicleNumber: z.string().trim().max(20).optional(),
  licenseNumber: z.string().trim().max(30).optional(),
});

const availabilitySchema = z.object({
  isAvailable: z.boolean(),
});

const locationSchema = z.object({
  coordinates: z.tuple([z.number(), z.number()]),
});

const listQuerySchema = paginationQuerySchema.omit({ q: true });

module.exports = { upsertProfileSchema, availabilitySchema, locationSchema, listQuerySchema };
