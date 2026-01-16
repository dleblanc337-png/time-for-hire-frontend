import React, { useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";

function DashboardLayout({ children }) {
  const location = useLocation();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const role = user?.role; // expected: "customer" | "helper" | "admin"

  const linkStyle = ({ isActive }) => ({
    display: "block",
    padding: "10px 14px",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "8px",
    margin: "4px 8px",
    background: isActive ? "rgba(255,255,255,0.18)" : "transparent",
    fontWeight: isActive ? 700 : 500,
  });

  // Single, clean menu. Show only what applies to the logged-in role.
  const menu = [
    { label: "My Profile", to: role === "helper" ? "/helper/profile" : "/customer/profile", show: !!role && role !== "admin" },
    { label: "My Bookings", to: "/customer/bookings", show: role === "customer" },
    { label: "My Messages", to: role === "helper" ? "/helper/messages" : "/customer/messages", show: role === "customer" || role === "helper" },
    { label: "My Availability", to: "/helper/availability", show: role === "helper" },
    { label: "My Earnings", to: "/helper/earnings", show: role === "helper" },

    // Admin (keep minimal)
    { label: "Admin Ledger", to: "/admin/ledger", show: role === "admin" },
  ].filter((x) => x.show);

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 80px)" }}>
      {/* Left sidebar */}
      <aside
        style={{
          width: 260,
          background: "#083b5b",
          color: "#fff",
          padding: "18px 10px",
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 800, padding: "8px 12px" }}>
          Dashboard
        </div>

        <div style={{ height: 10 }} />

        {menu.map((item) => (
          <NavLink key={item.to} to={item.to} style={linkStyle}>
            {item.label}
          </NavLink>
        ))}

        {/* If for any reason role missing, give a safe way back */}
        {!role && (
          <NavLink to="/dashboard" style={linkStyle}>
            Go to Dashboard
          </NavLink>
        )}

        {/* Debug helper (optional): uncomment if you ever need to confirm role)
        <div style={{ marginTop: 16, fontSize: 12, opacity: 0.75, padding: "0 12px" }}>
          role: {String(role)} | path: {location.pathname}
        </div>
        */}
      </aside>

      {/* Center content */}
      <main style={{ flex: 1, background: "#fff", padding: 24 }}>
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;
