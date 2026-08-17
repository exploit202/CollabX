const express = require('express');
const router = express.Router();
const { verifyJWT, authorizeRoles } = require('../../../middleware/auth.middleware');
const controller = require('../controllers/payoutAccount.controller');

router.use(verifyJWT);
router.use(authorizeRoles('creator'));

router.get('/', controller.getPayoutAccount);
router.post('/', controller.updatePayoutAccount);
router.patch('/', controller.updatePayoutAccount);

module.exports = router;
