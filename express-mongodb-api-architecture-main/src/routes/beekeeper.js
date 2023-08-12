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


router.get("/beekeepers",beekeeperController.getBeeKeepers)
router.get("/beekeepers/subownersbybeekeeper",beekeeperController.retreiveSubownersByBeekeeper)
router.get("/beekeepers/beehivebyfarm",beekeeperController.retreiveHivesByFarm)
router.post("/beekeepers/create/subowner",beekeeperController.addSubowner)
router.post("/beekeepers/create/farm",beekeeperController.createFarm)
router.post("/beekeepers/associate/beehivetofarm",beekeeperController.assignBeehiveToFarm)


module.exports = router;
