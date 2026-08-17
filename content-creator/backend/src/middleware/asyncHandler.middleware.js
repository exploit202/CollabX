/**
 * Async Handler Middleware Wrapper
 * Eliminates repetitive try-catch blocks in async express controllers.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
