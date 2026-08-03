const { z } = require('zod');
const { ROLES } = require('../constants/roles');

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
  phone: z.string().trim().max(20).optional(),
  role: z.enum([ROLES.CUSTOMER, ROLES.RESTAURANT_OWNER, ROLES.DELIVERY_PARTNER]).default(ROLES.CUSTOMER),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1, 'Password is required'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1).optional(),
});

const bootstrapAdminSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
  secret: z.string().min(1, 'Bootstrap secret is required'),
});

module.exports = { registerSchema, loginSchema, refreshTokenSchema, bootstrapAdminSchema };
