import React, { useMemo } from "react";
import { NavLink } from "react-router-dom";

function DashboardLayout({ children }) {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const helperEnabled = useMemo(() => {
    try {
      const hp = JSON.parse(localStorage.getItem("helperProfile") || "null");
      const enabled = !!hp?.offerServices;
      const hasServices = (hp?.services || "").trim().length > 0;
      const hasCity = (hp?.city || "").trim().length > 0;
      return enabled && hasServices && hasCity;
    } catch {
      return false;
    }
  }, []);

  const role = user?.role; // keep for now (backend still uses it)

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

  const menu = [
    { label: "My Profile", to: "/profile", show: true },

    // Customer features (existing)
    { label: "My Bookings", to: "/customer/bookings", show: role === "customer" },

    // Messages can be unified later; for now keep your existing routes:
    { label: "My Messages", to: role === "helper" ? "/helper/messages" : "/customer/messages", show: role === "customer" || role === "helper" },

    // Helper features unlocked by Offer Services completion
    { label: "My Availability", to: "/helper/availability", show: helperEnabled },
    { label: "My Earnings", to: "/helper/earnings", show: helperEnabled },

    // Admin (minimal)
    { label: "Admin Ledger", to: "/admin/ledger", show: role === "admin" },
  ].filter((x) => x.show);

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 80px)" }}>
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
      </aside>

      <main style={{ flex: 1, background: "#fff", padding: 24 }}>
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;
