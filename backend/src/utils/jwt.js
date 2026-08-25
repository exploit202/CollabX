const jwt = require('jsonwebtoken');

/**
 * Generate a JWT Access Token.
 * @param {object} payload - e.g. { userId, email, role }
 * @returns {string} Signed token
 */
const generateAccessToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  if (!secret) {
    throw new Error('JWT_SECRET is missing from environmental configuration.');
  }

  const plainPayload = payload && typeof payload.toObject === 'function' ? payload.toObject() : payload;
  const tokenPayload = {
    userId: plainPayload.userId || plainPayload._id || plainPayload.id,
    email: plainPayload.email,
    role: plainPayload.role
  };

  return jwt.sign(tokenPayload, secret, { expiresIn });
};

/**
 * Verify a JWT Access Token.
 * @param {string} token
 * @returns {object} Decoded token payload
 */
const verifyAccessToken = (token) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is missing from environmental configuration.');
  }

  return jwt.verify(token, secret);
};

/**
 * Generate a short-lived Password Reset Authorization Token (15m).
 * @param {object} payload - { userId, email }
 * @returns {string} Signed token
 */
const generatePasswordResetToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is missing from environmental configuration.');
  }

  const plainPayload = payload && typeof payload.toObject === 'function' ? payload.toObject() : payload;
  const tokenPayload = {
    userId: plainPayload.userId || plainPayload._id || plainPayload.id,
    email: plainPayload.email,
    purpose: 'password_reset_auth'
  };

  return jwt.sign(tokenPayload, secret, { expiresIn: '15m' });
};

/**
 * Verify a Password Reset Authorization Token.
 * @param {string} token
 * @returns {object} Decoded payload
 */
const verifyPasswordResetToken = (token) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is missing from environmental configuration.');
  }

  const decoded = jwt.verify(token, secret);
  if (decoded.purpose !== 'password_reset_auth') {
    const error = new Error('Invalid password reset token purpose.');
    error.statusCode = 401;
    error.code = 'INVALID_RESET_TOKEN';
    throw error;
  }

  return decoded;
};

/**
 * Helper to convert relative expiration strings to milliseconds.
 * @param {string} expiresIn
 * @returns {number}
 */
const parseExpiresInToMs = (expiresIn) => {
  if (!expiresIn || typeof expiresIn !== 'string') {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const unit = expiresIn.slice(-1);
  const val = parseInt(expiresIn.slice(0, -1), 10);

  if (isNaN(val)) {
    return 7 * 24 * 60 * 60 * 1000;
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
  generateAccessToken,
  verifyAccessToken,
  generateToken: generateAccessToken,
  generatePasswordResetToken,
  verifyPasswordResetToken,
  parseExpiresInToMs,
};
