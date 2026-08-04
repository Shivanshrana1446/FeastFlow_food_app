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

    // Gates POST /auth/bootstrap-admin — unset/undefined disables the endpoint entirely.
    // Meant for platforms without shell access (e.g. Render's free tier) where running
    // scripts/seedAdmin.js directly isn't an option.
    ADMIN_BOOTSTRAP_SECRET: z.string().min(16).optional(),

    // Required in every environment — uploads (restaurant logo/cover, menu item images, avatars)
    // go straight to Cloudinary with no local-disk fallback. Local disk storage was removed
    // because it silently loses every file on Render's free tier (ephemeral filesystem: a
    // redeploy or scale-to-zero wipes it), which is exactly what "production-ready" rules out.
    CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
    CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
    CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),

    // Razorpay test-mode keys (rzp_test_...) from the Dashboard's Settings > API Keys. The key id
    // is not a secret (the checkout widget ships it to the browser); the key secret signs/verifies
    // payments server-side and must never reach the client.
    RAZORPAY_KEY_ID: z.string().min(1, 'RAZORPAY_KEY_ID is required'),
    RAZORPAY_KEY_SECRET: z.string().min(1, 'RAZORPAY_KEY_SECRET is required'),

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
