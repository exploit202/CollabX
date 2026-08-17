const express = require('express');
const router = express.Router();
const { verifyJWT, authorizeRoles } = require('../../../middleware/auth.middleware');
const campaignController = require('../controllers/campaignController');

router.get('/discover', verifyJWT, campaignController.discoverCampaigns);
router.get('/', verifyJWT, campaignController.discoverCampaigns);
router.post('/:id/express-interest', verifyJWT, authorizeRoles('creator'), campaignController.expressInterest);
router.post('/:id/apply', verifyJWT, authorizeRoles('creator'), campaignController.expressInterest);
router.get('/:id', verifyJWT, campaignController.getCampaignById);

module.exports = router;
