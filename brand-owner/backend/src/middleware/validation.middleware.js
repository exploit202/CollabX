const { ZodError } = require('zod');
const mongoose = require('mongoose');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Generic request-body validation middleware for Zod schemas.
 */
const validateRequest = (schema) => (req, res, next) => {
  try {
    const validatedBody = schema.parse(req.body);
    req.body = validatedBody;

    return next();
  } catch (error) {
    console.error('VALIDATION ERROR:', error);

    if (error instanceof ZodError || error?.name === 'ZodError') {
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

    return errorResponse(
      res,
      500,
      'Validation processing failed.',
      'VALIDATION_PROCESSING_ERROR'
    );
  }
};

module.exports = validateRequest;

const validateObjectIdParam = (paramName = 'id') => (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params[paramName])) {
    return errorResponse(res, 400, `Invalid ${paramName} format.`, 'INVALID_OBJECT_ID');
  }
  return next();
};

module.exports.validateObjectIdParam = validateObjectIdParam;
