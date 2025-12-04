import React from "react";
import DashboardLayout from "../components/DashboardLayout";

function CustomerDashboard() {
    const user = JSON.parse(localStorage.getItem("user"));

    return (
    <DashboardLayout role="customer">
        <h1>Welcome, {user?.name || "Customer"}!</h1>
        <p>Your role: <strong>{user?.role}</strong></p>

        <h2>Your Bookings</h2>
        <p>(Bookings list will be added here)</p>

        <h2>Your Messages</h2>
        <p>(Messaging system coming soon)</p>
    </DashboardLayout>
);

}

export default CustomerDashboard;
