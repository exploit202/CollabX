const express = require('express');
const router = express.Router();
const paymentDemoController = require('../controllers/paymentDemo.controller');
const User = require('../../../models/user.model');
const { verifyAccessToken } = require('../../../utils/jwt');

// Optional auth helper: attaches user if token is present, but doesn't reject if missing
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers?.authorization;
    let token = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = verifyAccessToken(token);
        if (decoded?.userId) {
          const user = await User.findById(decoded.userId);
          if (user) {
            req.user = user;
            req.user.userId = user._id;
          }
        }
      } catch (err) {
        // Token invalid/expired - continue as unauthenticated
      }
    }
  } catch (e) {
    // Ignore error
  }
  next();
};

/**
 * Escrow Payment Endpoints
 */
router.post('/fund', optionalAuth, paymentDemoController.fundEscrow);
router.post('/release', optionalAuth, paymentDemoController.releaseEscrow);
router.get('/', optionalAuth, paymentDemoController.getPayments);

module.exports = router;
