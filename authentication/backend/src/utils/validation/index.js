const { z } = require('zod');

/**
 * Shared validation helpers for the backend.
 *
 * This module exposes a reusable Zod instance and can be extended with
 * common schema fragments for future modules such as auth, creator, brand,
 * and admin without coupling them to module-specific logic.
 */
const validation = {
  z,
};

module.exports = validation;
