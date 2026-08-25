const express = require('express');
const router = express.Router();
const { verifyJWT, authorizeRoles, optionalAuth } = require('../../../middleware/auth.middleware');
const portfolioController = require('../controllers/portfolioController');

router.get('/', optionalAuth, portfolioController.getPortfolio);
router.post('/', verifyJWT, authorizeRoles('creator'), portfolioController.addPortfolioItem);
router.delete('/:id', verifyJWT, authorizeRoles('creator'), portfolioController.deletePortfolioItem);

module.exports = router;
