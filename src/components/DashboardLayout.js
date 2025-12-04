import React from "react";
import { Link } from "react-router-dom";
import "./DashboardLayout.css";

function DashboardLayout({ children }) {
  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <h2 className="sidebar-title">Dashboard</h2>

        <nav className="dashboard-nav">
          <Link to="/customer" className="nav-item">Home</Link>
          <Link to="/customer/bookings" className="nav-item">My Bookings</Link>
          <Link to="/customer/messages" className="nav-item">Messages</Link>
          <Link to="/customer/profile" className="nav-item">Profile</Link>
        </nav>
      </aside>

      <main className="dashboard-content">
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;
