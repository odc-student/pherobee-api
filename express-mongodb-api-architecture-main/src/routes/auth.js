/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
// Packages
const router = require('express').Router();

// Middlewares
const verifyToken = require('../middlewares/verify-token');
const verifyRole = require('../middlewares/verify-role'); 

const { fileUpload } = require('../middlewares/multer');

// controllers
const authController = require('../controllers/AuthController');

/* -------------------------------------------------------------------------- */
/*                                 Auth Route                                 */
/* -------------------------------------------------------------------------- */

// Get reqyest - check if email exist or not
router.post('/auth/user-email', authController.checkExistEmail);


// POST request - sign in
router.post('/auth/login', authController.signIn);

// POST request - Send password reset link
router.post('/auth/forget-password', authController.forgotPassword);

// POST request - Send password reset link
router.post('/auth/reset-password/:token', authController.resetPassword);

/* -------------------------------------------------------------------------- */
/*                            Account Setting Route                           */
/* -------------------------------------------------------------------------- */

// PUT request - Disable user account
router.put('/account/:id/disable', verifyToken, authController.disableAccount);

// PUT request - Disable user account
router.post('/account/:token/enable', authController.enableAccount);

/* -------------------------------------------------------------------------- */
/*                                 User Route                                 */
/* -------------------------------------------------------------------------- */

// GET request - Get current user

router.get('/admin', verifyToken,verifyRole(['super admin']), (req, res) => {
  res.send('Welcome, super admin!');
});

// Protected route for bookkeepers
router.get('/bookkeeper',verifyToken, verifyRole(['beekeeper']), (req, res) => {
  res.send('Welcome, beekkeeper!');
});
router.get('/users/me', verifyToken, authController.getCurrentUser);

// PUT request - Update user by id
router.put(
  '/users/:id',
  verifyToken,
  fileUpload,
  authController.updateUserById,
);

// GET request - Get all users
router.get('/users', verifyToken, authController.getAllUsers);

// DELETE request - delete user
router.delete('/users/:id', verifyToken, authController.deleteUser);

module.exports = router;
