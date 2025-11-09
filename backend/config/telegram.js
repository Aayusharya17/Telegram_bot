const TelegramBot = require('node-telegram-bot-api');
const User = require('../models/User');
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
// Listen for /start command with verification code
bot.onText(/\/start (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const verificationCode = match[1];
    try {
        const user = await User.findOne({ verificationCode });
        if (!user) {
            bot.sendMessage(chatId, 'Invalid verification code. Please try again.');
            return;
        }
        user.telegramId = chatId.toString();
        user.telegramConnected = true;
        user.verificationCode = null;
        await user.save();
        bot.sendMessage(chatId, 'Successfully connected! You can now receive OTP codes here.')
    } catch (error) {
        console.error('Error linking Telegram:', error);
        bot.sendMessage(chatId, 'An error occurred. Please try again.');
    }
});
// Handle /help command
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    if (text === '/help') {
        bot.sendMessage(
            chatId,
            'Send /start [code] to connect your account.\nYou will receive OTP codes here after'
        );
    }
});
// Function to send message to user
const sendTelegramMessage = async (chatId, message) => {
    try {
        await bot.sendMessage(chatId, message);
        return true;
    } catch (error) {
        console.error('Error sending message:', error);
        return false;
    }
};
module.exports = { bot, sendTelegramMessage };