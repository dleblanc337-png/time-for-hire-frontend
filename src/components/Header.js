// src/components/Header.js
import React from "react";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header
      style={{
        width: "100%",
        padding: "20px",
        backgroundColor: "#0d47a1",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxSizing: "border-box",
      }}
    >
      <div style={{ fontSize: "24px", fontWeight: "bold" }}>
        Time For Hire
      </div>

      <nav style={{ display: "flex", gap: "15px" }}>
        <Link to="/" style={{ color: "white" }}>Home</Link>
        <Link to="/login" style={{ color: "white" }}>Login</Link>
        <Link to="/register" style={{ color: "white" }}>Create Account</Link>
      </nav>
    </header>
  );
}

export default Header;
