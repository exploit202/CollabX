const express = require('express');
const router = express.Router();
const { verifyJWT, authorizeRoles } = require('../../../middleware/auth.middleware');
const savedCreatorsController = require('../controllers/savedCreators.controller');

router.use(verifyJWT, authorizeRoles('brand'));

router.get('/', savedCreatorsController.getSavedCreators);
router.post('/:id', savedCreatorsController.saveCreator);
router.delete('/:id', savedCreatorsController.removeSavedCreator);

module.exports = router;
