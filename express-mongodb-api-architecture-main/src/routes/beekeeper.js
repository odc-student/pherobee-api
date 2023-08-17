/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
// Packages
const router = require('express').Router();

// Middlewares
const verifyToken = require('../middlewares/verify-token');
const verifyRole = require('../middlewares/verify-role');

const { fileUpload } = require('../middlewares/multer');

const beekeeperController = require('../controllers/beekeeper_controller');
const authController = require('../controllers/auth_controller');

router.post(
  '/beekeepers/assign-beehive',
  verifyToken,
  verifyRole(['super admin']),
  authController.assignBeehiveToBeekeeper
);

// POST request - Create a new beehive as a super admin

router.post(
  '/beekeepers/create-behive',
  verifyToken,
  verifyRole(['super admin']),
  authController.createBeehive
);

router.get("/beekeepers",verifyToken,verifyRole(["admin"]),beekeeperController.getBeeKeepers)
router.get("/beekeepers/:beekeeperid/subowners",verifyToken,verifyRole(["beekeeper"]),beekeeperController.retreiveSubownersByBeekeeper)
router.get("/beekeepers/:farmid/beehive",verifyToken,verifyRole(["beekeeper"]),beekeeperController.retreiveHivesByFarm)
router.post("/beekeepers/create/subowner",verifyToken,verifyRole(["beekeeper"]),beekeeperController.addSubowner)
router.post("/beekeepers/create/farm",verifyToken,verifyRole(["beekeeper"]),beekeeperController.createFarm)
router.post("/beekeepers/associate/beehive_to_farm",verifyToken,verifyRole(["beekeeper"]),beekeeperController.assignBeehiveToFarm)


module.exports = router;
