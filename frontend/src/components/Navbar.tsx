import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";

const Navbar: React.FC = () => {
  const { user, logout } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  return (
    <nav className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold flex items-center">
        <span role="img" aria-label="logo" className="mr-2">
          🛒
        </span>
        E-Commerce
      </Link>
      <div className="relative">
        {user ? (
          <div className="flex items-center">
            <button
              onClick={toggleDropdown}
              className="flex items-center space-x-2 hover:underline focus:outline-none"
            >
              <span role="img" aria-label="user-icon">
                👤
              </span>
              <span>{user.name}</span>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 bg-white text-black rounded shadow-lg">
                <Link
                  to="/dashboard"
                  className="block px-4 py-2 hover:bg-gray-200"
                  onClick={() => setDropdownOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="block px-4 py-2 hover:bg-gray-200"
                  onClick={() => setDropdownOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login" className="mr-4 hover:underline">
              Login
            </Link>
            <Link to="/signup" className="hover:underline">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;