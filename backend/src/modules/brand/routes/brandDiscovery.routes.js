const express = require('express');
const router = express.Router();
const brandDiscoveryController = require('../controllers/brandDiscovery.controller');

// Allow public/authenticated access to discover creators and fetch single creator details
router.get('/', brandDiscoveryController.getDiscoverCreators);
router.get('/:id', brandDiscoveryController.getCreatorById);

module.exports = router;
