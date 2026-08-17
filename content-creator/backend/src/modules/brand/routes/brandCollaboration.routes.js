const express = require('express');
const router = express.Router();
const { protect } = require('../../../middleware/auth.middleware');
const validate = require('../../../middleware/validate.middleware');
const { getBrandCollaborations, approveDeliverable } = require('../controllers/brandCollaboration.controller');
const { validateApproveDeliverable } = require('../../creator/validations/creatorCollaboration.validation');

router.use(protect);

router.get('/', getBrandCollaborations);
router.post('/:id/approve', validate(validateApproveDeliverable), approveDeliverable);

module.exports = router;
