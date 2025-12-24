const User = require('../models/User');
const jwt = require('jsonwebtoken');


const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({ email, password });

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

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      if (user.telegramConnected && user.telegramId) {
        const { sendTelegramMessage } = require('../config/telegram');
        const alertMessage = `SECURITY ALERT: Someone attempted to login to your account
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

exports.sendOTP = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user.telegramConnected) {
      return res.status(400).json({ message: 'Telegram not connected' });
    }

    const otp = generateCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

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
