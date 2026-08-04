process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_at_least_32_characters_long';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_at_least_32_characters_long';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.MONGO_URI = 'mongodb://127.0.0.1:65535/placeholder-unused';
process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
process.env.CLOUDINARY_API_KEY = 'test-api-key';
process.env.CLOUDINARY_API_SECRET = 'test-api-secret';
process.env.RAZORPAY_KEY_ID = 'rzp_test_fake_key_id';
process.env.RAZORPAY_KEY_SECRET = 'test_razorpay_key_secret';

// Real Cloudinary credentials aren't available in CI/local test runs, and tests shouldn't depend
// on network access anyway — fake the SDK boundary but keep it stream-shaped so our own
// upload_stream-piping code in utils/cloudinaryUpload.js is still genuinely exercised.
jest.mock('cloudinary', () => {
  const { Writable } = require('stream');
  let counter = 0;
  return {
    v2: {
      config: jest.fn(),
      uploader: {
        upload_stream: (options, callback) => {
          const writable = new Writable({
            write(chunk, encoding, cb) {
              cb();
            },
          });
          writable.on('finish', () => {
            counter += 1;
            callback(null, {
              secure_url: `https://res.cloudinary.com/test-cloud/image/upload/v1/${options.folder}/fake-${counter}.png`,
              public_id: `${options.folder}/fake-${counter}`,
            });
          });
          return writable;
        },
        destroy: jest.fn().mockResolvedValue({ result: 'ok' }),
      },
    },
  };
});

// Real Razorpay credentials aren't available in tests either — fake just the one call our code
// makes (orders.create) so order.service.js's real order-then-payment sequencing is still
// exercised, without ever hitting the network.
jest.mock('razorpay', () => {
  let counter = 0;
  return jest.fn().mockImplementation(() => ({
    orders: {
      create: jest.fn(({ amount, currency }) => {
        counter += 1;
        return Promise.resolve({ id: `order_test_fake_${counter}`, amount, currency, status: 'created' });
      }),
    },
  }));
});

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterEach(async () => {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});
