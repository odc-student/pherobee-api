const express = require('express');
const router = express.Router();
const HiveLogController = require('../controllers/HiveLogController');

router.post('/hive-logs', HiveLogController.createHiveLog);
router.get('/hive-logs/:beehiveId', HiveLogController.getHiveLogsByBeehive);

module.exports = router;
