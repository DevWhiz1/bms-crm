const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { validateUserRegistration, validateUserLogin, validateProfileUpdate } = require('../middleware/validation');

// Public routes
router.post('/signup', validateUserRegistration, userController.signup);
router.post('/login', validateUserLogin, userController.login);

// Protected routes (require authentication)
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, validateProfileUpdate, userController.updateProfile);
router.post('/logout', authenticateToken, userController.logout);
router.get('/verify-token', authenticateToken, userController.verifyToken);

module.exports = router;
