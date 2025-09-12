import React from "react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";

const Navbar: React.FC = () => {
  const { user, logout } = useUser();

  return (
    <nav className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold flex items-center">
        <span role="img" aria-label="logo" className="mr-2">
          {user ? "👤" : "🛒"}
        </span>
        E-Commerce
      </Link>
      <div>
        {user ? (
          <>
            <Link to="/dashboard" className="mr-4 hover:underline">
              Dashboard
            </Link>
            <button onClick={logout} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">
              Logout
            </button>
          </>
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