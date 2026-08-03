const path = require('path');
const dotenv = require('dotenv');
const { z } = require('zod');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().default(5000),
    API_VERSION: z.string().default('v1'),
    CLIENT_URL: z.string().optional(),

    MONGO_URI: z.string().min(1, 'MONGO_URI is required'),

    // 32 chars is a floor, not a target — HS256 secrets should be long, random strings
    // (e.g. `openssl rand -base64 48`), never a short/guessable string.
    JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
    JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

    BCRYPT_SALT_ROUNDS: z.coerce.number().default(10),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
    RATE_LIMIT_MAX: z.coerce.number().default(200),
    AUTH_RATE_LIMIT_MAX: z.coerce.number().default(20),

    LOG_LEVEL: z.string().default('info'),
  })
  .superRefine((data, ctx) => {
    // A missing CLIENT_URL should fail loudly in production rather than silently
    // falling back to a localhost origin that will never match the real frontend.
    if (data.NODE_ENV === 'production' && !data.CLIENT_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['CLIENT_URL'],
        message: 'CLIENT_URL is required in production',
      });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsed.data;

module.exports = {
  ...env,
  // Only defaulted for non-production — production requires a real value (see superRefine above).
  CLIENT_URL: env.CLIENT_URL || 'http://localhost:5173',
  isProduction: env.NODE_ENV === 'production',
  isDevelopment: env.NODE_ENV === 'development',
  isTest: env.NODE_ENV === 'test',
};
