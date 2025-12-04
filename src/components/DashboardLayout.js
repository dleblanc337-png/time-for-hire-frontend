import React from "react";
import "./DashboardLayout.css";
import { Link } from "react-router-dom";

function DashboardLayout({ children }) {
  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <h2>Dashboard</h2>

        <nav>
          <ul>
            <li><Link to="/customer/dashboard">Home</Link></li>
            <li><Link to="/customer/bookings">Bookings</Link></li>
            <li><Link to="/customer/messages">Messages</Link></li>
            <li><Link to="/customer/settings">Settings</Link></li>
          </ul>
        </nav>
      </aside>

      <main className="dashboard-content">{children}</main>
    </div>
  );
}

export default DashboardLayout;
