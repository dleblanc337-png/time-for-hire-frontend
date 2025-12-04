import React from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "./Header.css";

function Header() {
  const navigate = useNavigate();

  // Safely read user from localStorage
  let user = null;
  const storedUser = localStorage.getItem("tfh_user");

  if (storedUser && storedUser !== "undefined") {
    try {
      user = JSON.parse(storedUser);
    } catch (err) {
      console.error("Error parsing tfh_user from localStorage", err);
      // If it’s bad JSON, clear it so it doesn’t break again
      localStorage.removeItem("tfh_user");
    }
  }

  const isLoggedIn = !!user?.token;
  const role = user?.role || "customer";

  const handleLogout = () => {
    localStorage.removeItem("tfh_user");
    navigate("/login");
  };

  const dashboardPath =
    role === "helper" ? "/helper/dashboard" : "/customer/dashboard";

  const dashboardLabel =
    role === "helper" ? "My Helper Dashboard" : "My Dashboard";

  return (
    <header className="tfh-header">
      <div className="tfh-header-left">
        <Link to="/" className="tfh-logo-link">
          <img
            src={logo}
            alt="Time For Hire Logo"
            className="tfh-logo-image"
          />
          <div className="tfh-title-group">
            <span className="tfh-title">Time For Hire</span>
            <span className="tfh-slogan">MAKE IT WORK</span>
          </div>
        </Link>
      </div>

      <nav className="tfh-header-right">
        <Link to="/" className="tfh-nav-link">
          Home
        </Link>

        {isLoggedIn ? (
          <>
            <Link to={dashboardPath} className="tfh-nav-link">
              {dashboardLabel}
            </Link>
            <button className="tfh-nav-button" onClick={handleLogout}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="tfh-nav-link">
              Login
            </Link>
            <Link to="/register" className="tfh-nav-link">
              Create Account
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
