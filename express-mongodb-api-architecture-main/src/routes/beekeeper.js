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

router.get("/beekeepers",verifyToken,verifyRole(["super admin"]),beekeeperController.getBeeKeepers)
router.get("/beekeeper",verifyToken,verifyRole(["beekeeper"]),beekeeperController.getBeeKeepersById)
router.get("/beekeepers/:beekeeperid/subowners",beekeeperController.retrieveSubownersByBeekeeper)
router.get("/beekeepers/:farmid/beehive",verifyToken,verifyRole(["beekeeper"]),beekeeperController.retrieveHivesByFarm)
router.post("/beekeepers/create/subowner",verifyToken,verifyRole(["beekeeper"]),beekeeperController.addSubowner)
router.delete("/beekeepers/delete/subowner",verifyToken,verifyRole(["beekeeper"]),beekeeperController.deleteSubowner)
router.patch("/beekeepers/update/subowner",verifyToken,verifyRole(["beekeeper"]),beekeeperController.patchSubowner)
router.post("/beekeepers/create/farm",verifyToken,verifyRole(["beekeeper"]),beekeeperController.createFarm)
router.delete("/beekeepers/delete/farm",verifyToken,verifyRole(["beekeeper"]),beekeeperController.deleteFarm)
router.patch("/beekeepers/update/farm",verifyToken,verifyRole(["beekeeper"]),beekeeperController.updateFarm)
router.post("/beekeepers/associate/beehive_to_farm",verifyToken,verifyRole(["beekeeper"]),beekeeperController.assignBeehiveToFarm)
router.delete("/beekeepers/delete/beehive_from_farm",verifyToken,verifyRole(["beekeeper"]),beekeeperController.removeBeehiveFromFarm)
router.post("/beekeepers/associate/beehive_to_beekeeper",verifyToken,verifyRole(["admin"]),beekeeperController.assignBeehiveToBeekeeper)
router.post("/beekeepers/associate/farm_to_subowner",verifyToken,verifyRole(["beekeeper"]),beekeeperController.assignFarmToSubowner)
router.delete("/beekeepers/delete/farm_from_subowner",verifyToken,verifyRole(["beekeeper"]),beekeeperController.removeFarmFromSubowner)
// router.delete("/beekeepers/associate/beehive_to_beekeeper",verifyToken,verifyRole(["admin"]),beekeeperController.deleteBeehiveFromBeekeeper)


module.exports = router;
