/**
 * Validates req.body/req.query/req.params against Zod schemas and replaces
 * them with the parsed (and coerced/defaulted) values. Throws through to
 * errorHandler on failure, which formats ZodError into a 400 response.
 *
 * Usage: validate({ body: createOrderSchema, query: listQuerySchema })
 */
const validate = (schemas = {}) => (req, res, next) => {
  try {
    if (schemas.body) req.body = schemas.body.parse(req.body);
    if (schemas.query) req.query = schemas.query.parse(req.query);
    if (schemas.params) req.params = schemas.params.parse(req.params);
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = validate;
