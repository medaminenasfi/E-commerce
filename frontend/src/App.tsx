import React from "react";
import { Link, Outlet } from "react-router-dom";
import logo from './logo.svg';
import './App.css';

const App: React.FC = () => {
  return (
    <div>
      {/* Navbar */}
      <nav className="bg-blue-500 text-white py-4">
        <div className="container mx-auto flex justify-between items-center px-4">
          <Link to="/" className="text-2xl font-bold">
            E-Commerce
          </Link>
          <div className="space-x-4">
            <Link to="/login" className="hover:underline">
              Login
            </Link>
            <Link to="/signup" className="hover:underline">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Render child routes */}
      <div className="container mx-auto mt-4">
        <Outlet />
      </div>
    </div>
  );
}

export default App;
