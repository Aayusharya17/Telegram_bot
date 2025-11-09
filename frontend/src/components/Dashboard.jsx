import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [botUsername, setBotUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
  }, [navigate]);

  const getAxiosConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

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
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get code');
    }
  };

  const handleSendOTP = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/send-otp',
        {},
        getAxiosConfig()
      );
      setOtpSent(true);
      setMessage(response.data.message);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/verify-otp',
        { otp },
        getAxiosConfig()
      );
      setMessage(response.data.message);
      setError('');
      setOtp('');
      setOtpSent(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify OTP');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div>
      <div>
        <h2>Welcome, {user.email}</h2>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>

      <div>
        <h3>Telegram Integration</h3>

        {!verificationCode ? (
          <button onClick={handleConnectTelegram} className="primary-btn">
            Connect Telegram
          </button>
        ) : (
          <div>
            <div>
              <p>Your verification code:</p>
              <h2>{verificationCode}</h2>
              <p>
                Send this command to @{botUsername} on Telegram:
                <br />
                <code>/start {verificationCode}</code>
              </p>
            </div>

            {user.telegramConnected && (
              <>
                <button onClick={handleSendOTP} className="primary-btn">
                  Get OTP
                </button>

                {otpSent && (
                  <div>
                    <input
                      type="text"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength="6"
                    />
                    <button onClick={handleVerifyOTP} className="verify-btn">
                      Verify OTP
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {message && <div>{message}</div>}
        {error && <div>{error}</div>}
      </div>
    </div>
  );
};

export default Dashboard;
