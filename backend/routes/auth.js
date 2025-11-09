const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
// Protected routes
router.post('/get-telegram-code', authMiddleware, authController.getTelegramCode);
router.post('/send-otp', authMiddleware, authController.sendOTP);
router.post('/verify-otp', authMiddleware, authController.verifyOTP);
router.get('/check-telegram', authMiddleware, authController.checkTelegramConnected);
module.exports = router;
