const express = require('express');
const router = express.Router();
const HiveLogController = require('../controllers/hive_log_controller');

router.post('/hive-logs', HiveLogController.createHiveLog);
router.get('/hive-logs/', HiveLogController.getHiveLogsByBeehive);

module.exports = router;
