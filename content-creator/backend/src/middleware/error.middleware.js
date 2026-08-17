const { errorResponse } = require('../utils/apiResponse');

/**
 * Global Error Handling Middleware.
 * Catches errors passed via next(error) and formats them into standard API responses.
 */
const errorHandler = (err, req, res, next) => {
  // Log the error for internal tracking (development/monitoring)
  console.error('❌ Error handled globally:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred.';
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  const details = err.details || null;

  return errorResponse(res, statusCode, message, errorCode, details);
};

module.exports = errorHandler;
