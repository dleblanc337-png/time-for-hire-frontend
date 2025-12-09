import React from "react";
import { Link } from "react-router-dom";

function DashboardLayout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      
      {/* SIDEBAR */}
      <div style={{ width: "220px", background: "#0A3A66", color: "white", padding: "20px" }}>
        <h2>Dashboard</h2>

        {/* ✅ FIXED: Home now goes to MAIN calendar homepage */}
        <Link to="/" style={linkStyle}>Home</Link>

        <Link to="/customer-dashboard/bookings" style={linkStyle}>My Bookings</Link>
        <Link to="/customer-dashboard/messages" style={linkStyle}>Messages</Link>
        <Link to="/customer-profile" style={linkStyle}>Profile</Link>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: "30px" }}>
        {children}
      </div>
    </div>
  );
}

const linkStyle = {
  display: "block",
  color: "white",
  textDecoration: "none",
  marginBottom: "15px",
  fontSize: "16px",
};

export default DashboardLayout;
