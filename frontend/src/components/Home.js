import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [user, setUser] = useState(null);
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div>
      <div>
        <h1>Welcome Home! 🎉</h1>
        <div>
          <p>
            Logged in as: <strong>{user.email}</strong>
          </p>
          <div>
            {user.telegramConnected ? (
              <span>✅ Telegram Connected</span>
            ) : (
              <span>⚠️ Telegram Not Connected</span>
            )}
          </div>
        </div>

        <div>
          <p>You have successfully logged in to your account!</p>
          <p>Your account is now secured with Telegram OTP verification.</p>

          <div>
            <div>
              <h3>🔐 Secure Login</h3>
              <p>Your account is protected with encrypted passwords</p>
            </div>

            <div>
              <h3>📱 Telegram Integration</h3>
              <p>Receive security alerts on your Telegram</p>
            </div>

            <div>
              <h3>⏰ OTP Verification</h3>
              <p>Two-factor authentication via Telegram</p>
            </div>
          </div>
        </div>

        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Home;
