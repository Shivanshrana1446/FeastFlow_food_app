const app = require('./app');
const env = require('./config/env');
const logger = require('./config/logger');
const { connectDB } = require('./config/db');

let server;

async function start() {
  await connectDB();
  server = app.listen(env.PORT, () => {
    logger.info(`Server listening on port ${env.PORT} [${env.NODE_ENV}]`);
    logger.info(`Swagger docs available at http://localhost:${env.PORT}/docs`);
  });
}

function shutdown(reason, exitCode = 0) {
  logger.info(`${reason} received, shutting down gracefully`);
  if (server) {
    server.close(() => process.exit(exitCode));
    // Don't hang forever waiting for in-flight requests that never finish.
    setTimeout(() => process.exit(exitCode), 10000).unref();
  } else {
    process.exit(exitCode);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection: ${reason?.stack || reason}`);
  shutdown('unhandledRejection', 1);
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.stack || err}`);
  shutdown('uncaughtException', 1);
});

start();
