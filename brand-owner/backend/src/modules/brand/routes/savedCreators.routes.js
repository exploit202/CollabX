const express = require('express');
const router = express.Router();

const controller = require('../controllers/savedCreators.controller');
const discoverController = require('../controllers/discoverCreators.controller');
const { authenticate } = require('../../../middleware/auth.middleware');


// Discover creators
router.use(authenticate);
router.get(
  '/creators/search',
  discoverController.searchCreators
);


router.get(
  '/creators/filter',
  discoverController.filterCreators
);

router.get(
  '/creators',
  discoverController.getDiscoverCreators
);

router.get(
  '/creators/:id',
  discoverController.getCreatorProfile
);


// Saved creators
router.post(
  '/saved-creators',
  controller.saveCreator
);

router.delete(
  '/saved-creators/:creatorId',
  controller.removeSavedCreator
);

router.get(
  '/saved-creators',
  controller.getSavedCreators
);


module.exports = router;