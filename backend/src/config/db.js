const mongoose = require('mongoose');
const env = require('./env');
const logger = require('./logger');

mongoose.set('strictQuery', true);

async function connectDB() {
  mongoose.connection.on('connected', () => logger.info('MongoDB connection established'));
  mongoose.connection.on('error', (err) => logger.error(`MongoDB connection error: ${err.message}`));
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB connection lost'));

  await mongoose.connect(env.MONGO_URI);
  return mongoose.connection;
}

async function disconnectDB() {
  await mongoose.disconnect();
}

module.exports = { connectDB, disconnectDB };
