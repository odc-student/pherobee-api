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
router.post("/create/subowner",beekeeperController.addSubowner)
router.post("/create/farm",beekeeperController.createFarm)


module.exports = router;
