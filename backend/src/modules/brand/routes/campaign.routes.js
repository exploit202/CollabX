const express = require('express');
const campaignController = require('../controllers/campaign.controller');
const { verifyJWT, authorizeRoles } = require('../../../middleware/auth.middleware');

const router = express.Router();

router.get('/', verifyJWT, campaignController.getCampaigns);
router.get('/:id', campaignController.getCampaignById);

router.post('/', verifyJWT, authorizeRoles('brand'), campaignController.createCampaign);
router.patch('/:id', verifyJWT, authorizeRoles('brand'), campaignController.updateCampaign);
router.delete('/:id', verifyJWT, authorizeRoles('brand'), campaignController.deleteCampaign);
router.patch('/:id/status', verifyJWT, authorizeRoles('brand'), campaignController.updateCampaignStatus);
router.patch('/:id/applications/count', verifyJWT, campaignController.incrementApplicationsCount);

module.exports = router;
