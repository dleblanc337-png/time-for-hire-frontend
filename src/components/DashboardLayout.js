import React from "react";
import { Link } from "react-router-dom";
import "./DashboardLayout.css";

function DashboardLayout({ title, children }) {
  // Safely read user/role from localStorage
  let user = null;
  const storedUser = localStorage.getItem("tfh_user");

  if (storedUser && storedUser !== "undefined") {
    try {
      user = JSON.parse(storedUser);
    } catch (err) {
      console.error("Error parsing tfh_user in DashboardLayout", err);
      localStorage.removeItem("tfh_user");
    }
  }

  const role = user?.role || "customer";
  const base = role === "helper" ? "/helper" : "/customer";

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <h2>{title}</h2>
        <ul>
          {/* Common overview */}
          <li>
            <Link to={`${base}/dashboard`}>Overview</Link>
          </li>

          {role === "helper" ? (
            <>
              <li>
                <Link to={`${base}/jobs`}>My Jobs</Link>
              </li>
              <li>
                <Link to={`${base}/messages`}>Messages</Link>
              </li>
              <li>
                <Link to={`${base}/earnings`}>Earnings</Link>
              </li>
              <li>
                <Link to={`${base}/availability`}>Availability</Link>
              </li>
              <li>
                <Link to={`${base}/profile`}>Profile</Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to={`${base}/bookings`}>My Bookings</Link>
              </li>
              <li>
                <Link to={`${base}/messages`}>Messages</Link>
              </li>
              <li>
                <Link to={`${base}/profile`}>Profile</Link>
              </li>
            </>
          )}
        </ul>
      </aside>

      <main className="dashboard-content">{children}</main>
    </div>
  );
}

export default DashboardLayout;
