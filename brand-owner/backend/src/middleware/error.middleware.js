const { errorResponse } = require('../utils/apiResponse');

/**
 * Global Error Handling Middleware.
 * Catches errors passed via next(error) and formats them into standard API responses.
 */
const errorHandler = (err, req, res, next) => {
  // Log the error for internal tracking (development/monitoring)
  console.error('❌ Error handled globally:', err);

  const isCastError = err.name === 'CastError';
  const isDuplicateKeyError = err.code === 11000;
  const statusCode = err.statusCode || (isCastError ? 400 : isDuplicateKeyError ? 409 : 500);
  const message = isCastError ? 'Invalid resource ID format.' : isDuplicateKeyError ? 'A record with this value already exists.' : (err.message || 'An unexpected error occurred.');
  const errorCode = isCastError ? 'INVALID_OBJECT_ID' : isDuplicateKeyError ? 'DUPLICATE_RECORD' : (err.code || 'INTERNAL_SERVER_ERROR');
  const details = err.details || null;

  return errorResponse(res, statusCode, message, errorCode, details);
};

module.exports = errorHandler;
