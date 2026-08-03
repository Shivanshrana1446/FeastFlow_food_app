const { z } = require('zod');
const mongoose = require('mongoose');

const objectId = (fieldName = 'id') =>
  z.string().refine((v) => mongoose.Types.ObjectId.isValid(v), { message: `Invalid ${fieldName}` });

/**
 * Query-string boolean parser. `z.coerce.boolean()` is unsafe here because
 * `Boolean("false")` is `true` — any non-empty string coerces truthy. This only
 * accepts the literal strings "true"/"false" (or an already-boolean value).
 */
const booleanQueryParam = () =>
  z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === true || v === 'true'));

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  q: z.string().trim().optional(),
  sortBy: z.string().trim().optional(),
});

const idParamSchema = z.object({
  id: objectId(),
});

module.exports = { objectId, paginationQuerySchema, idParamSchema, booleanQueryParam };
