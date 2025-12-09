import React from "react";
import { Link } from "react-router-dom";

function DashboardLayout({ children }) {
  const linkStyle = {
    display: "block",
    padding: "12px 20px",
    color: "white",
    textDecoration: "none",
    fontWeight: "500",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* SIDEBAR */}
      <div
        style={{
          width: "220px",
          background: "#003f63",
          paddingTop: "30px",
        }}
      >
        <h2 style={{ color: "white", paddingLeft: "20px" }}>Dashboard</h2>

        {/* ✅ SINGLE HOME LINK ONLY */}
        <Link to="/" style={linkStyle}>Home</Link>
        <Link to="/customer-bookings" style={linkStyle}>My Bookings</Link>
        <Link to="/customer-messages" style={linkStyle}>Messages</Link>
        <Link to="/customer-profile" style={linkStyle}>Profile</Link>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: "30px" }}>
        {children}
      </div>
    </div>
  );
}

export default DashboardLayout;
