import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const Signup = () => {
  const [step, setStep] = useState('form'); // form, telegram, otp
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [botUsername, setBotUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [telegramConnected, setTelegramConnected] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.match(/^\S+@\S+\.\S+$/)) {
      newErrors.email = 'Invalid email format';
    }
    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 1: Create Account
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/signup',
        {
          email: formData.email,
          password: formData.password,
        }
      );

      // Store token (account created)
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Move to Telegram verification step
      setStep('telegram');
      setMessage('');
    } catch (err) {
      setErrors({
        submit: err.response?.data?.message || 'Signup failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const getAxiosConfig = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  // Step 2: Get Telegram Code
  const handleConnectTelegram = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/get-telegram-code',
        {},
        getAxiosConfig()
      );
      setVerificationCode(response.data.verificationCode);
      setBotUsername(response.data.botUsername);
      setMessage('');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to get code');
    }
  };

  // Step 2: Check Telegram Connection
  const checkTelegramConnection = async () => {
    try {
      await axios.get('http://localhost:5000/api/health');
      setTelegramConnected(true);
      setMessage('✅ Telegram connected successfully!');
    } catch (err) {
      setMessage('Please send the code to the bot first');
    }
  };

  // Step 2 → 3: Send OTP
  const handleSendOTP = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/send-otp',
        {},
        getAxiosConfig()
      );
      setStep('otp');
      setMessage(response.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  // Step 3: Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setMessage('Please enter a valid 6-digit OTP');
      return;
    }
    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/verify-otp',
        { otp },
        getAxiosConfig()
      );
      setMessage(response.data.message);
      setOtp('');

      // Redirect to home after successful OTP verification
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to verify OTP');
    }
  };

  // STEP 1: Signup Form
  if (step === 'form') {
    return (
      <div>
        <div>
          <h2>Create Account</h2>
          <form onSubmit={handleSignupSubmit}>
            <div>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
              {errors.email && <span>{errors.email}</span>}
            </div>

            <div>
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                required
              />
              {errors.password && <span>{errors.password}</span>}
            </div>

            <div>
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                required
              />
              {errors.confirmPassword && <span>{errors.confirmPassword}</span>}
            </div>

            {errors.submit && <div>{errors.submit}</div>}

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p>
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    );
  }

  // STEP 2: Connect Telegram
  if (step === 'telegram') {
    return (
      <div>
        <div>
          <h2>Connect Telegram 📱</h2>
          <div>
            <p>Secure your account by connecting Telegram</p>
          </div>

          {!verificationCode ? (
            <>
              <p>Generate a verification code to connect your Telegram</p>
              <button onClick={handleConnectTelegram} className="submit-btn">
                Generate Verification Code
              </button>
            </>
          ) : (
            <div>
              <div>
                <p>Your verification code:</p>
                <h2>{verificationCode}</h2>
                <div>
                  <p>📌 Send this command to Telegram bot:</p>
                  <code>/start {verificationCode}</code>
                  <p>Bot: @{botUsername}</p>
                </div>
              </div>

              {!telegramConnected && (
                <div>
                  <p>⏳ Waiting for Telegram connection...</p>
                  <p>After sending the code to the bot, click button below</p>
                </div>
              )}

              <button
                onClick={checkTelegramConnection}
                className="secondary-btn"
              >
                Check Connection Status
              </button>

              {telegramConnected && (
                <button onClick={handleSendOTP} className="submit-btn">
                  Send OTP to Telegram
                </button>
              )}
            </div>
          )}

          {message && <div>{message}</div>}
        </div>
      </div>
    );
  }

  // STEP 3: Verify OTP
  if (step === 'otp') {
    return (
      <div>
        <div>
          <h2>Verify OTP ✅</h2>
          <div>
            <p>Check your Telegram for the OTP code</p>
          </div>

          <div>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.slice(0, 6))}
              maxLength="6"
              className="otp-input"
            />
            <button onClick={handleVerifyOTP} className="submit-btn">
              Verify OTP
            </button>
          </div>

          {message && <div>{message}</div>}

          <p>Didn't receive OTP? Check your Telegram spam folder</p>
        </div>
      </div>
    );
  }
};

export default Signup;
