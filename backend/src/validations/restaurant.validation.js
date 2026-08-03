const { z } = require('zod');
const { booleanQueryParam, paginationQuerySchema } = require('./common.validation');

const openingHourSchema = z.object({
  day: z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']),
  open: z.string().regex(/^\d{2}:\d{2}$/, 'Expected HH:mm'),
  close: z.string().regex(/^\d{2}:\d{2}$/, 'Expected HH:mm'),
});

const addressSchema = z.object({
  line1: z.string().trim().min(1).max(200),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(1).max(100),
  postalCode: z.string().trim().min(1).max(20),
  country: z.string().trim().min(1).max(100).default('India'),
});

const createRestaurantSchema = z.object({
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().max(1000).optional(),
  cuisine: z.array(z.string().trim().max(50)).max(20).default([]),
  address: addressSchema,
  location: z.object({
    // Explicit + defaulted (not left to the Mongoose schema's default) because updateRestaurant
    // does `Object.assign(restaurant, updates)`, which replaces the whole `location` subdocument
    // wholesale — if `type` isn't in the validated body, it gets wiped from an existing
    // restaurant, and MongoDB's 2dsphere index then fails to build a geo key at all ("Can't
    // extract geo keys") because it can't tell what kind of geometry the coordinates describe.
    type: z.literal('Point').default('Point'),
    coordinates: z.tuple([z.number(), z.number()]),
  }),
  openingHours: z.array(openingHourSchema).max(7).default([]),
  minOrderAmount: z.coerce.number().min(0).default(0),
  avgPreparationTimeMinutes: z.coerce.number().positive().default(30),
});

const updateRestaurantSchema = createRestaurantSchema.partial().extend({
  isOpen: z.boolean().optional(),
});

const listRestaurantsQuerySchema = paginationQuerySchema.extend({
  cuisine: z.string().trim().optional(),
  city: z.string().trim().optional(),
  isOpen: booleanQueryParam(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radiusKm: z.coerce.number().positive().max(50).optional(),
});

module.exports = {
  createRestaurantSchema,
  updateRestaurantSchema,
  listRestaurantsQuerySchema,
};
