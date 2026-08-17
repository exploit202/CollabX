const { ZodError } = require('zod');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Generic request-body validation middleware for Zod schemas.
 *
 * This middleware is intentionally module-agnostic and can be reused by
 * auth, creator, brand, admin, or any future module that needs to validate
 * incoming request bodies.
 *
 * @param {import('zod').ZodTypeAny} schema - Zod schema for the request body.
 * @returns {Function} Express middleware.
 */
const validateRequest = (schema) => (req, res, next) => {
  try {
    const validatedBody = schema.parse(req.body);
    req.body = validatedBody;
    return next();
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.issues.map((issue) => ({
        field: issue.path.join('.') || 'body',
        message: issue.message,
        code: issue.code
      }));

      return errorResponse(
        res,
        400,
        'Validation failed.',
        'VALIDATION_ERROR',
        details
      );
    }

    return errorResponse(res, 500, 'Validation processing failed.', 'VALIDATION_PROCESSING_ERROR');
  }
};

module.exports = validateRequest;
