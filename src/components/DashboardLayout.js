import React from "react";
import { Link } from "react-router-dom";
import "../styles/DashboardLayout.css";

function DashboardLayout({ children }) {
  return (
    <div className="dashboard-container">
      {/* ✅ LEFT SIDEBAR (ONLY ONE) */}
      <aside className="dashboard-sidebar">
        <h2>Dashboard</h2>

        <nav className="dashboard-nav">
          <Link to="/customer-home">Home</Link>
          <Link to="/customer-bookings">My Bookings</Link>
          <Link to="/customer-messages">Messages</Link>
          <Link to="/customer-profile">Profile</Link>
        </nav>
      </aside>

      {/* ✅ MAIN CONTENT */}
      <main className="dashboard-content">
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;
