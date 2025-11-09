import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [securityAlert, setSecurityAlert] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSecurityAlert('');
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/login',
        formData
      );

      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Navigate to HOME PAGE after successful login
      navigate('/');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed';
      setError(errorMsg);

      // If password was wrong, show security alert message
      if (errorMsg === 'Invalid credentials' && formData.email) {
        setSecurityAlert(
          '🚨 Security Alert: If this account has Telegram connected, a security notification has been sent!'
        );
        console.log(`[SECURITY] Failed login attempt for: ${formData.email}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div>
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
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
          </div>

          <div>
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && <div className="error">{error}</div>}
          {securityAlert && <div className="alert">{securityAlert}</div>}

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p>
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
