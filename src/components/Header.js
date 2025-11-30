// frontend/src/components/Header.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import logo from "../assets/logo.png";

function Header({ isLoggedIn, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <header className="tfh-header">
      <div className="tfh-header-left">
        <img src={logo} alt="Time For Hire Logo" className="tfh-logo-image" />
        <div className="tfh-title-group">
          <span className="tfh-title">Time For Hire</span>
          <span className="tfh-slogan">MAKE IT WORK</span>
        </div>
      </div>

      <nav className="tfh-header-right">
        <Link to="/" className="tfh-nav-link">Home</Link>

        {!isLoggedIn ? (
          <>
            <Link to="/login" className="tfh-nav-link">Login</Link>
            <Link to="/register" className="tfh-nav-link">Create Account</Link>
          </>
        ) : (
          <>
            <Link to="/customer-dashboard" className="tfh-nav-link">My Dashboard</Link>
            <button className="tfh-logout-btn" onClick={handleLogout}>
              Log Out
            </button>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
