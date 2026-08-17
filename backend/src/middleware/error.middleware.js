const { errorResponse } = require('../utils/apiResponse');

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('SERVER ERROR CAUGHT:', err);

  // 1. Mongoose CastError (Malformed ObjectId)
  if (err.name === 'CastError' || err.kind === 'ObjectId') {
    return errorResponse(
      res,
      400,
      `Invalid ID format for ${err.path || 'resource'}: '${err.value}'.`,
      'INVALID_OBJECT_ID'
    );
  }

  // 2. Mongoose Schema ValidationError
  if (err.name === 'ValidationError' && err.errors) {
    const messages = Object.values(err.errors).map((e) => e.message).join(', ');
    return errorResponse(
      res,
      400,
      messages || 'Validation failed for request data.',
      'VALIDATION_ERROR'
    );
  }

  // 3. Duplicate Key Error (MongoDB Code 11000)
  if (err.code === 11000) {
    return errorResponse(
      res,
      409,
      'Duplicate record already exists in the system.',
      'DUPLICATE_KEY_ERROR'
    );
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'ERROR');

  return errorResponse(res, statusCode, message, code, err.details || null);
};

module.exports = errorHandler;
