import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import signupimage from "../signupimage.png"


const Signup = () => {
  const [checkingConnection, setCheckingConnection] = useState(false);
  const [step, setStep] = useState("form");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [botUsername, setBotUsername] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
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
      newErrors.email = "Invalid email format";
    }
    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/signup",
        {
          email: formData.email,
          password: formData.password,
        }
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      setStep("telegram");
      setMessage("");
    } catch (err) {
      setErrors({
        submit: err.response?.data?.message || "Signup failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAxiosConfig = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const handleConnectTelegram = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/get-telegram-code",
        {},
        getAxiosConfig()
      );
      setVerificationCode(response.data.verificationCode);
      setBotUsername(response.data.botUsername);
      setMessage("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to get code");
    }
  };

  const checkTelegramConnection = async () => {
    setCheckingConnection(true);
    try {
      const response = await axios.get(
        'http://localhost:5000/api/auth/check-telegram',
        getAxiosConfig()
      );
      setTelegramConnected(true);
      if (response.data.success && response.data.telegramConnected) {
        setMessage(' Telegram connected successfully!');
      } else {
        setTelegramConnected(false);
        setMessage(' Please send the code to the bot first: /start ' + verificationCode);
      }
    } catch (err) {
      setTelegramConnected(false);
      setMessage('Error checking Telegram connection. Please try again.');
    } finally {
      setCheckingConnection(false);
    }
  };


  const handleSendOTP = async () => {
    if (!telegramConnected) {
      setMessage(' Please connect Telegram first');
      return;
    }

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


  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setMessage("Please enter a valid 6-digit OTP");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/verify-otp",
        { otp },
        getAxiosConfig()
      );
      setMessage(response.data.message);
      setOtp("");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to verify OTP");
    }
  };

  if (step === "form") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6ff] px-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* LEFT IMAGE SECTION */}
        <div className="h-full hidden md:flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600">
          <img
            src={signupimage} // put image in public folder
            alt="Signup Illustration"
            className="h-full w-full object-contain"
          />
        </div>

        {/* RIGHT FORM SECTION */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Create Account
          </h2>
          <p className="text-gray-500 mb-6 text-sm">
            Create your account to get started.
          </p>

          <form onSubmit={handleSignupSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="text-red-600 text-sm bg-red-100 border border-red-300 rounded-lg p-2">
                {errors.submit}
              </div>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-lg font-semibold text-white transition ${
                loading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
  }

  if (step === "telegram") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Connect Telegram
          </h2>
          <p className="text-gray-600 mb-4">
            Secure your account by connecting Telegram
          </p>

          {!verificationCode ? (
            <>
              <p className="text-gray-600 mb-3">
                Generate a verification code to connect your Telegram
              </p>
              <button
                onClick={handleConnectTelegram}
                className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Generate Verification Code
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-700">Your verification code:</p>
                <h2 className="text-xl font-semibold text-blue-600">
                  {verificationCode}
                </h2>
                <p className="text-gray-600 mt-2">
                  Send this command to Telegram bot:
                </p>
                <code className="block bg-gray-100 rounded-lg py-1 px-2 text-sm text-gray-700">
                  /start {verificationCode}
                </code>
                <p className="text-gray-700 mt-1">Bot: @{botUsername}</p>
              </div>

              {!telegramConnected && (
                <div className="text-gray-600">
                  <p> Waiting for Telegram connection...</p>
                  <p>After sending the code to the bot, click below</p>
                </div>
              )}


              <button
                onClick={checkTelegramConnection}
                disabled={checkingConnection}
                className="w-full py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition"
              >
                {checkingConnection ? 'Checking...' : 'Check Connection Status'}
              </button>


              {telegramConnected && (
                <button
                  onClick={handleSendOTP}
                  disabled={!telegramConnected}
                  className="submit-btn"
                  style={{ opacity: telegramConnected ? 1 : 0.5, cursor: telegramConnected ? 'pointer' : 'not-allowed' }}
                >
                  Send OTP to Telegram
                </button>

              )}
            </div>
          )}

          {message && (
            <div className="mt-4 text-sm text-gray-700 bg-gray-100 border border-gray-200 rounded-lg p-2">
              {message}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Verify OTP
          </h2>
          <p className="text-gray-600 mb-3">
            Check your Telegram for the OTP code
          </p>

          <div className="flex flex-col gap-3 items-center">
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.slice(0, 6))}
              maxLength="6"
              className="w-40 text-center px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none tracking-widest text-lg"
            />
            <button
              onClick={handleVerifyOTP}
              className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Verify OTP
            </button>
          </div>

          {message && (
            <div className="mt-4 text-sm text-gray-700 bg-gray-100 border border-gray-200 rounded-lg p-2">
              {message}
            </div>
          )}

          <p className="text-sm text-gray-600 mt-4">
            Didn’t receive OTP? Check your Telegram spam folder.
          </p>
        </div>
      </div>
    );
  }
};

export default Signup;
