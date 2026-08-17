const jwt = require('jsonwebtoken');

/**
 * Generate a JWT Access Token.
 *
 * @param {object} payload - Payloads like { userId, email, role }.
 * @returns {string} Signed JWT token.
 */
const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  if (!secret) {
    throw new Error('JWT_SECRET is missing from environmental configuration.');
  }

  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Helper to convert relative expiration strings (e.g. '7d', '24h', '1h') to milliseconds.
 * Useful for configuring cookie maxAge.
 *
 * @param {string} expiresIn - Expiry string.
 * @returns {number} Time in milliseconds.
 */
const parseExpiresInToMs = (expiresIn) => {
  if (!expiresIn || typeof expiresIn !== 'string') {
    return 7 * 24 * 60 * 60 * 1000; // default to 7 days
  }

  const unit = expiresIn.slice(-1);
  const val = parseInt(expiresIn.slice(0, -1), 10);

  if (isNaN(val)) {
    return 7 * 24 * 60 * 60 * 1000; // default fallback
  }

  switch (unit) {
    case 'd':
      return val * 24 * 60 * 60 * 1000;
    case 'h':
      return val * 60 * 60 * 1000;
    case 'm':
      return val * 60 * 1000;
    case 's':
      return val * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
};

module.exports = {
  generateToken,
  parseExpiresInToMs
};
