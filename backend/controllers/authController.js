const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// Generate random 6-digit code
const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ================= SIGNUP =================
exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new user
    const user = await User.create({ email, password });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // 🚨 Send Telegram alert on failed login
      if (user.telegramConnected && user.telegramId) {
        const { sendTelegramMessage } = require('../config/telegram');
        const alertMessage = `🚨 SECURITY ALERT: Someone attempted to login to your account
Time: ${new Date().toLocaleString()}
If this wasn't you, please secure your account immediately.`;

        await sendTelegramMessage(user.telegramId, alertMessage).catch((err) => {
          console.error('Failed to send Telegram alert:', err);
        });
      }

      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        telegramConnected: user.telegramConnected,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= GET TELEGRAM CODE =================
exports.getTelegramCode = async (req, res) => {
  try {
    const userId = req.user.id;
    const verificationCode = generateCode();

    await User.findByIdAndUpdate(userId, { verificationCode });

    res.json({
      success: true,
      verificationCode,
      botUsername: process.env.TELEGRAM_BOT_USERNAME,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= SEND OTP =================
exports.sendOTP = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user.telegramConnected) {
      return res.status(400).json({ message: 'Telegram not connected' });
    }

    const otp = generateCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    user.otp = { code: otp, expiresAt };
    await user.save();

    const { sendTelegramMessage } = require('../config/telegram');
    await sendTelegramMessage(
      user.telegramId,
      `Your OTP is: ${otp}\n\nThis code will expire in 5 minutes.`
    );

    res.json({
      success: true,
      message: 'OTP sent to your Telegram',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= VERIFY OTP =================
exports.verifyOTP = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otp } = req.body;
    const user = await User.findById(userId);

    if (!user.otp || !user.otp.code) {
      return res.status(400).json({ message: 'No OTP requested' });
    }

    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    if (user.otp.code !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    user.otp = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'OTP verified successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.checkTelegramConnected = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        telegramConnected: false, 
        message: 'User not found' 
      });
    }
    
    // Return ACTUAL telegramConnected status from database
    res.json({
      success: true,
      telegramConnected: user.telegramConnected,
      message: user.telegramConnected ? 'Telegram is connected' : 'Telegram not connected yet'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      telegramConnected: false, 
      message: error.message 
    });
  }
};
