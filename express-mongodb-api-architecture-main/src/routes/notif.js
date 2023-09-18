// Packages
const router = require('express').Router();
const NotificationController = require('../controllers/notification_controller');
const verifyToken = require("../middlewares/verify-token");
const verifyRole = require("../middlewares/verify-role");

router.post('/send-notif', NotificationController.sendNotif);
router.get('/get-notif',verifyToken,verifyRole(["beekeeper","subowner"]), NotificationController.getNotifications);

module.exports = router;
