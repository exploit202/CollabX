const router = require("express").Router();

const { authenticate } = require("../../../middleware/auth.middleware");
const controller = require("../controllers/brandProfile.controller");

router.use(authenticate);

router.get("/", controller.getProfile);
router.patch("/", controller.updateProfile);

module.exports = router;