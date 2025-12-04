import React from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "./Header.css";

function Header() {
  const navigate = useNavigate();

  // --- SAFE LOCALSTORAGE PARSE ---
  let user = null;
  let role = null;

  try {
    const raw = localStorage.getItem("user");
    if (raw) {
      user = JSON.parse(raw);
      role = user?.role || null;
    }
  } catch (err) {
    console.error("Invalid user JSON → clearing storage");
    localStorage.removeItem("user");
  }

  const isLoggedIn = !!user;

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    window.location.reload();
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

      <nav className="tfh-nav">
        {!isLoggedIn && (
          <>
            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Create Account</Link>
          </>
        )}

        {isLoggedIn && role === "customer" && (
          <>
            <Link to="/customer/dashboard">Dashboard</Link>
            <Link to="/customer/bookings">Bookings</Link>
            <Link to="/customer/messages">Messages</Link>
          </>
        )}

        {isLoggedIn && role === "helper" && (
          <>
            <Link to="/helper/dashboard">Dashboard</Link>
            <Link to="/helper/jobs">Jobs</Link>
            <Link to="/helper/messages">Messages</Link>
          </>
        )}

        {isLoggedIn && (
          <button className="tfh-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
      </nav>
    </header>
  );
}

export default Header;
