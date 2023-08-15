const express = require('express');
const router = express.Router();

const verifyToken = require('../middlewares/verify-token');
const verifyRole = require('../middlewares/verify-role'); 

const authController = require('../controllers/AuthController'); 

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

module.exports = router;
