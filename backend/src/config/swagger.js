const swaggerJSDoc = require('swagger-jsdoc');
const env = require('./env');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Online Food Ordering & Restaurant Management System API',
      version: '1.0.0',
      description:
        'REST API for a multi-role food ordering platform (Customer, Restaurant Owner, ' +
        'Delivery Partner, Admin). See /docs in this repo for the database schema, ER ' +
        'diagram, and a Postman collection.',
    },
    servers: [{ url: `/api/${env.API_VERSION}`, description: 'Current API version' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ApiError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
  ],
};

module.exports = swaggerJSDoc(options);
