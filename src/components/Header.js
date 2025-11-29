// src/components/Header.js

import React from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo.png";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <img src={logo} alt="Time For Hire" style={styles.logo} />
        <div>
          <div style={styles.title}>Time For Hire</div>
          <div style={styles.subtitle}>Make It Work</div>
        </div>
      </div>

      <nav style={styles.nav}>
        {/* HOME BUTTON */}
        <button style={styles.navButton} onClick={() => navigate("/")}>
          Home
        </button>

        {/* LOGIN BUTTON – FIXED */}
        <Link to="/login">
          <button style={styles.navButton}>Log In</button>
        </Link>

        {/* CONTACT BUTTON */}
        <button style={styles.navButton} onClick={() => navigate("/contact")}>
          Contact
        </button>
      </nav>
    </header>
  );
};

export default Header;

const styles = {
  header: {
    width: "100%",
    backgroundColor: "#004580",
    color: "#ffffff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 32px",
    boxSizing: "border-box",
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: "8px",
    objectFit: "cover",
  },
  title: {
    fontSize: "20px",
    fontWeight: 600,
  },
  subtitle: {
    fontSize: "12px",
    opacity: 0.9,
  },
  nav: {
    display: "flex",
    gap: "12px",
  },
  navButton: {
    padding: "6px 18px",
    borderRadius: "999px",
    border: "none",
    cursor: "pointer",
    background: "#005fb3",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 500,
  },
};
