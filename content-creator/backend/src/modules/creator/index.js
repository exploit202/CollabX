const express = require('express');
const router = express.Router();

router.use('/requests', require('./routes/creatorRequest.routes'));
router.use('/negotiations', require('./routes/creatorNegotiation.routes'));
router.use('/collaborations', require('./routes/creatorCollaboration.routes'));
router.use('/notifications', require('./routes/creatorNotification.routes'));
router.use('/profile', require('./routes/creatorProfile.routes'));
router.use('/dashboard', require('./routes/creatorDashboard.routes'));
router.use('/reviews', require('./routes/review.routes'));
router.use('/pricing', require('./pricing/routes/pricing.routes'));
router.use('/portfolio', require('./routes/portfolioRoutes'));
router.use('/discover', require('./routes/discoverRoutes'));
router.use('/campaigns', require('./routes/campaignRoutes'));

module.exports = router;
