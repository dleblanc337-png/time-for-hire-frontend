import React from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "./Header.css";

function Header() {
  const navigate = useNavigate();

  // Read login state from localStorage
  let isLoggedIn = false;
  let role = null;
  let user = null;

  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      user = JSON.parse(storedUser);
      role = user.role;
      isLoggedIn = true;
    }
  } catch (e) {
    console.error("Error parsing user from localStorage", e);
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("isLoggedIn");
    navigate("/");
    window.location.reload();
  };

  return (
    <header className="tfh-header">
      <div className="tfh-header-left">
        <img src={logo} alt="Time For Hire logo" className="tfh-logo-image" />

        <div className="tfh-title-group">
          <span className="tfh-title">Time For Hire</span>
          <span className="tfh-slogan">MAKE IT WORK</span>
        </div>
      </div>

      <nav className="tfh-header-right">
        {/* Always show Home */}
        <Link to="/" className="tfh-nav-link">
          Home
        </Link>

        {/* Not logged in → Login + Create Account */}
        {!isLoggedIn && (
          <>
            <Link to="/login" className="tfh-nav-link">
              Login
            </Link>
            <Link to="/register" className="tfh-nav-link">
              Create Account
            </Link>
          </>
        )}

        {/* Logged in as CUSTOMER */}
        {isLoggedIn && role === "customer" && (
          <>
            <Link to="/customer-dashboard" className="tfh-nav-link">
              My Dashboard
            </Link>
            <button className="tfh-logout-btn" onClick={handleLogout}>
              Log Out
            </button>
          </>
        )}

        {/* Logged in as HELPER */}
        {isLoggedIn && role === "helper" && (
          <>
            <Link to="/helper-dashboard" className="tfh-nav-link">
              Helper Dashboard
            </Link>
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
