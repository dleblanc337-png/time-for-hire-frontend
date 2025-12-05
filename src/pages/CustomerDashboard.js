import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";

function CustomerDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load user info from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const displayName = user
    ? `${user.name?.split(" ")[0] || ""} ${
        user.name?.split(" ")[1]?.charAt(0) || ""
      }.`
    : "";

  return (
    <DashboardLayout>
      {/* Top Banner Name */}
      {user && (
        <div
          style={{
            padding: "10px 0",
            borderBottom: "1px solid #ccc",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ margin: 0 }}>
            Welcome back, <span style={{ color: "#003f63" }}>{displayName}</span>
          </h2>
        </div>
      )}

      {/* Page Content */}
      <h1>Customer Dashboard</h1>
      <p>Your bookings, messages, and profile will appear here.</p>
    </DashboardLayout>
  );
}

export default CustomerDashboard;
