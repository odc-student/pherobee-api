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


router.get("/beekeepers",verifyToken,verifyRole(["admin"]),beekeeperController.getBeeKeepers)
router.get("/beekeepers/:beekeeperid/subowners",verifyToken,verifyRole(["beekeeper"]),beekeeperController.retreiveSubownersByBeekeeper)
router.get("/beekeepers/:farmid/beehive",verifyToken,verifyRole(["beekeeper"]),beekeeperController.retreiveHivesByFarm)
router.post("/beekeepers/create/subowner",verifyToken,verifyRole(["beekeeper"]),beekeeperController.addSubowner)
router.post("/beekeepers/create/farm",verifyToken,verifyRole(["beekeeper"]),beekeeperController.createFarm)
// router.post("/beekeepers/associate/beehive_to_farm",verifyToken,verifyRole(["beekeeper"]),beekeeperController.assignBeehiveToFarm)
// router.post("/beekeepers/associate/beehive_to_beekeeper",verifyToken,verifyRole(["beekeeper"]),beekeeperController.assignBeehiveToBeekeeper)


module.exports = router;
