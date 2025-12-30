import React from "react";
import { Link } from "react-router-dom";

function DashboardLayout({ children }) {
  let user = null;
  let email = null;

  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      user = JSON.parse(storedUser);
      email = user.email;
    }
  } catch (e) {
    console.error("Error reading user from localStorage", e);
  }

  const isAdmin = email === "admin@timeforhire.ca";

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "220px",
          background: "#003f63",
          color: "#fff",
          padding: "20px 15px",
        }}
      >
        <h2 style={{ fontSize: "18px", marginBottom: "20px" }}>Dashboard</h2>

        <nav>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {/* Customer side */}
            <li style={{ marginBottom: "10px" }}>
              <Link to="/customer-dashboard" style={linkStyle}>
                Customer Home
              </Link>
            </li>
            <li style={{ marginBottom: "10px" }}>
              <Link to="/customer-bookings" style={linkStyle}>
                My Bookings
              </Link>
            </li>
            <li style={{ marginBottom: "10px" }}>
              <Link to="/customer-messages" style={linkStyle}>
                My Messages
              </Link>
            </li>
            <li style={{ marginBottom: "10px" }}>
              <Link to="/customer-profile" style={linkStyle}>
                My Profile
              </Link>
            </li>

            <hr style={{ borderColor: "#ffffff55", margin: "12px 0" }} />

            {/* Helper side */}
            <li style={{ marginBottom: "10px" }}>
              <Link to="/helper-messages" style={linkStyle}>
                Helper Jobs
              </Link>
            </li>
            <li style={{ marginBottom: "10px" }}>
              <Link to="/helper-earnings" style={linkStyle}>
                Helper Earnings
              </Link>
            </li>
            <li style={{ marginBottom: "10px" }}>
              <Link to="/helper-profile" style={linkStyle}>
                Helper Profile
              </Link>
            </li>
            <li style={{ marginBottom: "10px" }}>
              <Link to="/helper-availability" style={linkStyle}>
                Helper Availability
              </Link>
            </li>

            {/* Admin-only section */}
            {isAdmin && (
              <>
                <hr style={{ borderColor: "#ffffff55", margin: "12px 0" }} />
                <li style={{ marginBottom: "10px" }}>
                  <Link to="/admin-ledger" style={linkStyle}>
                    Admin Ledger
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: "20px" }}>{children}</main>
    </div>
  );
}

const linkStyle = {
  color: "#fff",
  textDecoration: "none",
  fontSize: "14px",
};

export default DashboardLayout;
