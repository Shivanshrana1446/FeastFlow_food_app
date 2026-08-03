const path = require('path');
const winston = require('winston');
const env = require('./env');

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const consoleFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack }) => `${ts} [${level}]: ${stack || message}`)
);

const fileFormat = combine(timestamp(), errors({ stack: true }), json());

// Always log to stdout — container platforms (Docker, Kubernetes, ECS) capture
// process output for log aggregation, and a container that only writes to a
// file is invisible to `docker logs` and every downstream log pipeline.
const transports = [
  new winston.transports.Console({ format: env.isProduction ? fileFormat : consoleFormat }),
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'error.log'),
    level: 'error',
    format: fileFormat,
  }),
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'combined.log'),
    format: fileFormat,
  }),
];

const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  transports,
  exitOnError: false,
  silent: env.isTest,
});

// Consumed by morgan so HTTP access logs flow through the same transports.
logger.stream = {
  write: (message) => logger.info(message.trim()),
};

module.exports = logger;
