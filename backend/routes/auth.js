const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/get-telegram-code', authMiddleware, authController.getTelegramCode);
router.post('/send-otp', authMiddleware, authController.sendOTP);
router.post('/verify-otp', authMiddleware, authController.verifyOTP);
router.get('/check-telegram', authMiddleware, authController.checkTelegramConnected);
module.exports = router;
