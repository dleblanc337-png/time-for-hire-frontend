import React from "react";
import "./DashboardLayout.css";
import { Link } from "react-router-dom";

function DashboardLayout({ children }) {
  // Safely load user from localStorage
  const storedUser = localStorage.getItem("user");
  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (err) {
    console.error("Invalid JSON in localStorage 'user'", err);
    user = null;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Dashboard</h2>

      {user ? (
        <p>Logged in as: <strong>{user.email}</strong></p>
      ) : (
        <p style={{ color: "red" }}>No user loaded.</p>
      )}

      <div style={{ marginTop: "20px" }}>
        {children}
      </div>
    </div>
  );
}

export default DashboardLayout;
