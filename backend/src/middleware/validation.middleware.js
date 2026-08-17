const mongoose = require('mongoose');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Express middleware for validating request bodies against Zod schemas.
 * @param {import('zod').ZodSchema} schema
 */
const validateRequest = (schema) => async (req, res, next) => {
  try {
    req.body = await schema.parseAsync(req.body);
    next();
  } catch (error) {
    if (error.name === 'ZodError' || error.issues || error.errors) {
      const issuesArray = error.issues || error.errors || [];
      const details = issuesArray.map((e) => ({
        field: Array.isArray(e.path) ? e.path.join('.') : String(e.path || ''),
        message: e.message
      }));
      console.error('VALIDATION ERROR DETAILS:', JSON.stringify(details, null, 2));
      return errorResponse(res, 400, 'Validation failed', 'VALIDATION_ERROR', details);
    }
    next(error);
  }
};

/**
 * Express middleware for validating route URL parameters as valid Mongo ObjectIds.
 * @param {...string} paramNames
 */
const validateObjectId = (...paramNames) => (req, res, next) => {
  for (const paramName of paramNames) {
    const value = req.params[paramName];
    if (value && !mongoose.Types.ObjectId.isValid(value)) {
      return errorResponse(
        res,
        400,
        `Invalid ID format for parameter '${paramName}': '${value}'.`,
        'INVALID_OBJECT_ID'
      );
    }
  }
  next();
};

validateRequest.validateRequest = validateRequest;
validateRequest.validateObjectId = validateObjectId;

module.exports = validateRequest;
