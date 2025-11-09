import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    const userData = JSON.parse(localStorage.getItem("user"));
    setUser(userData);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) return null;
  console.log(user);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
<nav className="fixed top-0 left-0 w-full z-10 bg-white border-b shadow-sm">
  <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-2">
    {/* Left - Logo */}
    <h1 className="text-2xl font-bold text-gray-800 font-serif tracking-tight select-none">
      Instagram
    </h1>

    {/* Middle - Search bar (hidden on small screens) */}
    <div className="hidden sm:flex items-center bg-gray-100 px-3 py-1 rounded-full w-64 focus-within:ring-2 focus-within:ring-gray-300">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
        stroke="currentColor"
        className="w-5 h-5 text-gray-500 mr-2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.35z"
        />
      </svg>
      <input
        type="text"
        placeholder="Search"
        className="bg-transparent outline-none w-full text-sm text-gray-700"
      />
    </div>

    {/* Right - Icons + Logout */}
    <div className="flex items-center space-x-5">
      {/* Home */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
        stroke="currentColor"
        className="w-6 h-6 text-gray-700 cursor-pointer hover:text-black transition"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75h-15A.75.75 0 015 21V9.75z"
        />
      </svg>

      {/* Message */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
        stroke="currentColor"
        className="w-6 h-6 text-gray-700 cursor-pointer hover:text-black transition"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7.5 8.25h9m-9 3.75h6M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>

      {/* Profile avatar */}
      <img
        src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${user.email}`}
        alt="profile"
        className="w-8 h-8 rounded-full border cursor-pointer hover:opacity-80 transition"
      />

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs font-medium"
      >
        Logout
      </button>
    </div>
  </div>
</nav>


      {/* Profile Section */}
      <div className="pt-20 flex flex-col items-center pb-8 border-b">
        <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-10 space-y-4 sm:space-y-0">
          <img
            src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${user.email}`}
            alt="Profile"
            className="w-28 h-28 rounded-full border-2 border-gray-300"
          />

          <div className="text-center sm:text-left">
            <h2 className="text-xl font-semibold text-gray-800">
              {user.email.split("@")[0]}
            </h2>

            

            <div className="flex justify-center sm:justify-start mt-3 space-x-4 text-gray-600 text-sm">
              <span>
                <strong>42</strong> posts
              </span>
              <span>
                <strong>1,234</strong> followers
              </span>
              <span>
                <strong>980</strong> following
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="max-w-4xl mx-auto py-8 px-4 grid grid-cols-3 gap-2">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-200 overflow-hidden rounded-sm">
            <img
              src={`https://picsum.photos/400/400?random=${i}`}
              alt="Post"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm py-4 border-t">
      </footer>
    </div>
  );
};

export default Home;
