import React from "react";
import DashboardLayout from "../components/DashboardLayout";

function HelperDashboard() {
    const user = JSON.parse(localStorage.getItem("user"));

    return (
    <DashboardLayout role="helper">
        <h1>Welcome, {user?.name || "Helper"}!</h1>
        <p>Your role: <strong>{user?.role}</strong></p>

        <h2>Your Jobs</h2>
        <p>(Job list will be added here)</p>

        <h2>Messages</h2>
        <p>(Messaging system coming soon)</p>
    </DashboardLayout>
);
}

export default HelperDashboard;
