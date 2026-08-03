const { z } = require('zod');
const { PAYMENT_METHOD_VALUES, ORDER_STATUS_VALUES } = require('../constants/orderStatus');
const { paginationQuerySchema } = require('./common.validation');

const deliveryAddressSchema = z.object({
  line1: z.string().trim().min(1),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(1),
  state: z.string().trim().min(1),
  postalCode: z.string().trim().min(1),
  country: z.string().trim().min(1).default('India'),
  location: z
    .object({
      coordinates: z.tuple([z.number(), z.number()]),
    })
    .optional(),
});

const placeOrderSchema = z.object({
  deliveryAddress: deliveryAddressSchema,
  paymentMethod: z.enum(PAYMENT_METHOD_VALUES),
});

const listOrdersQuerySchema = paginationQuerySchema.omit({ q: true }).extend({
  status: z.enum(ORDER_STATUS_VALUES).optional(),
});

const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUS_VALUES),
  note: z.string().trim().max(500).optional(),
  cancellationReason: z.string().trim().max(500).optional(),
});

module.exports = { placeOrderSchema, listOrdersQuerySchema, updateOrderStatusSchema };
