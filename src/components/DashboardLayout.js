import React from "react";
import { Link } from "react-router-dom";

function DashboardLayout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "240px",
          backgroundColor: "#0a3c6e",
          color: "white",
          padding: "30px 20px",
        }}
      >
        <h2 style={{ marginBottom: "30px" }}>Dashboard</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <Link to="/customer-home" style={linkStyle}>Home</Link>
          <Link to="/customer-bookings" style={linkStyle}>My Bookings</Link>
          <Link to="/customer-messages" style={linkStyle}>Messages</Link>
          <Link to="/customer-profile" style={linkStyle}>Profile</Link>
        </div>
      </div>

      {/* Page Content */}
      <div style={{ flex: 1, padding: "40px" }}>
        {children}
      </div>
    </div>
  );
}

const linkStyle = {
  color: "white",
  textDecoration: "none",
  fontSize: "16px"
};

export default DashboardLayout;
