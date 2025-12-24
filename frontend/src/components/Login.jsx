import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import loginimage from "../login.webp"

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [securityAlert, setSecurityAlert] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSecurityAlert("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Login failed";
      setError(errorMsg);

      if (errorMsg === "Invalid credentials" && formData.email) {
        setSecurityAlert(
          "🚨 Security Alert: If this account has Telegram connected, a security notification has been sent!"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* LEFT SECTION */}
        <div className="p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Hello, <br /> Welcome Back
            </h1>
            <p className="text-gray-500 mt-2">
              Hey, welcome back to your special place
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />

            <div className="flex items-center justify-between text-sm text-gray-600">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-purple-600" />
                Remember me
              </label>
            </div>

            {error && (
              <div className="text-red-600 bg-red-100 border border-red-300 p-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            {securityAlert && (
              <div className="text-yellow-700 bg-yellow-100 border border-yellow-300 p-2 rounded-lg text-sm">
                {securityAlert}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-semibold transition ${
                loading
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-sm text-gray-600 mt-6">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-purple-600 font-semibold">
              Sign Up
            </Link>
          </p>
        </div>

        {/* RIGHT SECTION (ILLUSTRATION) */}
        <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-500 p-10 overflow-hidden">
            <img
              src={loginimage}
              alt="Login Illustration"
              className="w-full h-full max-w-md object-contain"
            />
          </div>

      </div>
    </div>
  );
};

export default Login;
